"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  RecorderSettings,
  RecorderSource,
  RecorderStatus,
  RecordingArtifact,
} from "../types/recorder";
import { useRecordingsStore } from "@/stores/recordings-store";
import type { RecordingQuality } from "@/types/recording";

const DEFAULT_SETTINGS: RecorderSettings = {
  source: "screen",
  microphone: true,
  webcam: false,
  systemAudio: true,
  quality: "1080p",
};

const QUALITY_CONSTRAINTS: Record<RecordingQuality, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
};

function getBestMimeType() {
  return (
    [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  );
}

function createFallbackStream() {
  return new MediaStream();
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [settings, setSettings] = useState<RecorderSettings>(DEFAULT_SETTINGS);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [webcamPreviewUrl, setWebcamPreviewUrl] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<RecordingArtifact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [countdownValue, setCountdownValue] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const durationRef = useRef(0);

  const addRecording = useRecordingsStore((s) => s.addRecording);

  const stopTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    webcamStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;
    webcamStreamRef.current = null;
    screenStreamRef.current = null;
    setScreenStream(null);
    setWebcamStream(null);
  }, []);

  const resetSession = useCallback(() => {
    stopTimer();
    stopTracks();
    recorderRef.current = null;
    setIsInitializing(false);
  }, [stopTimer, stopTracks]);

  const buildCombinedStream = useCallback(
    async (source: RecorderSource) => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
        setWebcamStream(null);
      }

      const dims = QUALITY_CONSTRAINTS[settings.quality];

      if (source === "webcam") {
        const webcamStreamLocal = await navigator.mediaDevices.getUserMedia({
          video: { width: dims.width, height: dims.height },
          audio: settings.microphone,
        });
        webcamStreamRef.current = webcamStreamLocal;
        setWebcamStream(webcamStreamLocal);
        return webcamStreamLocal;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: dims.width, height: dims.height },
        audio: settings.systemAudio,
      });
      screenStreamRef.current = displayStream;
      setScreenStream(displayStream);

      let micStream: MediaStream | null = null;
      if (settings.microphone) {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      let webcamStreamLocal: MediaStream | null = null;
      if (settings.webcam) {
        try {
          webcamStreamLocal = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 360 },
            audio: false,
          });
          webcamStreamRef.current = webcamStreamLocal;
          setWebcamStream(webcamStreamLocal);
        } catch (err) {
          console.error("Webcam recording failed to start:", err);
        }
      }

      const tracks = [
        ...displayStream.getVideoTracks(),
        ...(displayStream.getAudioTracks() ?? []),
        ...(micStream?.getAudioTracks() ?? []),
        ...(webcamStreamLocal?.getVideoTracks() ?? []),
      ];

      return tracks.length ? new MediaStream(tracks) : createFallbackStream();
    },
    [settings.microphone, settings.systemAudio, settings.webcam, settings.quality]
  );

  const startRecording = useCallback(
    async (source?: RecorderSource) => {
      try {
        setError(null);
        setIsInitializing(true);
        setStatus("idle");

        const selectedSource = source ?? settings.source;
        const combinedStream = await buildCombinedStream(selectedSource);
        streamRef.current = combinedStream;

        const mimeType = getBestMimeType();
        const recorder = new MediaRecorder(
          combinedStream,
          mimeType ? { mimeType, videoBitsPerSecond: 4_000_000 } : undefined
        );

        chunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorderRef.current = recorder;
        setStatus("countdown");
        setCountdownValue(3);

        return selectedSource;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start recording");
        setStatus("error");
        resetSession();
      } finally {
        setIsInitializing(false);
      }
    },
    [buildCombinedStream, resetSession, settings.source]
  );

  // Countdown timer effect
  useEffect(() => {
    if (status !== "countdown") return;

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (recorderRef.current && recorderRef.current.state === "inactive") {
        try {
          recorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, {
              type: recorderRef.current?.mimeType || "video/webm",
            });
            const url = URL.createObjectURL(blob);

            setPreviewUrl(url);
            const dims = QUALITY_CONSTRAINTS[settings.quality];
            const artifact: RecordingArtifact = {
              id: crypto.randomUUID(),
              name: `Recording ${artifacts.length + 1}`,
              createdAt: new Date().toISOString(),
              duration: durationRef.current,
              size: blob.size,
              url,
              mimeType: blob.type,
            };

            setArtifacts((current) => [artifact, ...current]);

            // Persist to global store
            addRecording({
              id: artifact.id,
              name: artifact.name,
              url,
              mimeType: artifact.mimeType,
              duration: artifact.duration,
              size: artifact.size,
              resolution: `${dims.width}x${dims.height}`,
              quality: settings.quality,
              createdAt: artifact.createdAt,
              updatedAt: artifact.createdAt,
              status: "local",
              hasAudio: settings.microphone || settings.systemAudio,
              hasWebcam: settings.webcam || settings.source === "webcam",
              source: settings.source,
            });

            setStatus("stopped");
            setDuration(0);
            setAudioLevel(0);
            resetSession();
          };

          recorderRef.current.start(1000);
          setStatus("recording");

          setDuration(0);
          durationRef.current = 0;
          timerRef.current = window.setInterval(() => {
            setDuration((current) => {
              const next = current + 1;
              durationRef.current = next;
              return next;
            });
            setAudioLevel(Math.min(100, Math.max(10, Math.round(Math.random() * 100))));
          }, 1000);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to start recording");
          setStatus("error");
          resetSession();
        }
      }
    }
  }, [status, countdownValue, resetSession, addRecording, settings.quality, settings.source, settings.microphone, settings.systemAudio, settings.webcam, artifacts.length]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      setStatus("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      setStatus("recording");

      timerRef.current = window.setInterval(() => {
        setDuration((current) => {
          const next = current + 1;
          durationRef.current = next;
          return next;
        });
        setAudioLevel(Math.min(100, Math.max(10, Math.round(Math.random() * 100))));
      }, 1000);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      resetSession();
      setStatus("stopped");
    }
  }, [resetSession]);

  const cancelRecording = useCallback(() => {
    resetSession();
    setStatus("idle");
  }, [resetSession]);

  const updateSetting = useCallback(
    <K extends keyof RecorderSettings>(key: K, value: RecorderSettings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const deleteRecording = useCallback((id: string) => {
    setArtifacts((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      stopTracks();
      artifacts.forEach((artifact) => {
        if (artifact.url.startsWith("blob:")) URL.revokeObjectURL(artifact.url);
      });
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preview webcam (idle / setup mode)
  useEffect(() => {
    if (status !== "idle" && status !== "stopped" && status !== "error") return;

    let activeStream: MediaStream | null = null;
    let cancelled = false;

    async function loadWebcamPreview() {
      if (!settings.webcam && settings.source !== "webcam") {
        setWebcamStream(null);
        setWebcamPreviewUrl(null);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = stream;
        webcamStreamRef.current = stream;
        setWebcamStream(stream);

        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play().catch(() => undefined);

        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setWebcamPreviewUrl(canvas.toDataURL("image/png"));
        }
      } catch {
        setWebcamStream(null);
        setWebcamPreviewUrl(null);
      }
    }

    loadWebcamPreview();

    return () => {
      cancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [settings.source, settings.webcam, status]);

  return useMemo(
    () => ({
      status,
      settings,
      duration,
      audioLevel,
      previewUrl,
      webcamPreviewUrl,
      screenStream,
      webcamStream,
      countdownValue,
      artifacts,
      error,
      isInitializing,
      startRecording,
      pauseRecording,
      resumeRecording,
      stopRecording,
      cancelRecording,
      updateSetting,
      deleteRecording,
      setPreviewUrl,
    }),
    [
      artifacts,
      audioLevel,
      duration,
      error,
      isInitializing,
      pauseRecording,
      previewUrl,
      resumeRecording,
      startRecording,
      status,
      stopRecording,
      cancelRecording,
      updateSetting,
      deleteRecording,
      webcamPreviewUrl,
      screenStream,
      webcamStream,
      countdownValue,
    ]
  );
}
