"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  RecorderSettings,
  RecorderSource,
  RecorderStatus,
  RecordingArtifact,
} from "../types/recorder";

const DEFAULT_SETTINGS: RecorderSettings = {
  source: "screen",
  microphone: true,
  webcam: false,
  systemAudio: true,
  quality: "1080p",
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

  // Live preview streams and countdown value
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
      // Release camera preview before acquiring recording stream
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
        setWebcamStream(null);
      }

      if (source === "webcam") {
        const webcamStreamLocal = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: settings.microphone,
        });
        webcamStreamRef.current = webcamStreamLocal;
        setWebcamStream(webcamStreamLocal);
        return webcamStreamLocal;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
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
            video: true,
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
    [settings.microphone, settings.systemAudio, settings.webcam]
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
          mimeType ? { mimeType } : undefined
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
      // Start recording!
      if (recorderRef.current && recorderRef.current.state === "inactive") {
        try {
          recorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, {
              type: recorderRef.current?.mimeType || "video/webm",
            });
            const url = URL.createObjectURL(blob);

            setPreviewUrl(url);
            setArtifacts((current) => [
              {
                id: crypto.randomUUID(),
                name: `Recording ${current.length + 1}`,
                createdAt: new Date().toISOString(),
                duration: durationRef.current,
                size: blob.size,
                url,
                mimeType: blob.type,
              },
              ...current,
            ]);
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
  }, [status, countdownValue, resetSession]);

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
  }, [artifacts, previewUrl, stopTimer, stopTracks]);

  // Preview webcam (idle / setup mode)
  useEffect(() => {
    // Only run preview if status is idle, stopped, or error.
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
