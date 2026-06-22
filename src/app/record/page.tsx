"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Film,
  Mic,
  Monitor,
  MonitorPlay,
  Pause,
  Play,
  Sparkles,
  Square,
  Trash2,
  Video,
  VideoOff,
  Volume2,
  Webcam,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { QualitySelector } from "@/components/recorder/quality-selector";
import { SourceSelector } from "@/components/recorder/source-selector";
import { PostRecordingPanel } from "@/components/recorder/post-recording-panel";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import { useRecorder } from "@/features/recorder/hooks/use-recorder";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useDriveUpload } from "@/features/drive/hooks/use-drive-upload";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePendingActionStore } from "@/stores/pending-action-store";
import type { Recording } from "@/types/recording";

function LiveVideo({ stream, muted = true, className = "" }: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const playVideo = async () => {
      try {
        if (video.paused) await video.play();
      } catch (err) {
        console.error("Play failed for LiveVideo:", err);
      }
    };

    playVideo();

    const handleTrackEvent = () => playVideo();
    stream.addEventListener("addtrack", handleTrackEvent);
    stream.addEventListener("removetrack", handleTrackEvent);

    return () => {
      stream.removeEventListener("addtrack", handleTrackEvent);
      stream.removeEventListener("removetrack", handleTrackEvent);
      if (video) video.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={cn("w-full h-full object-cover", className)}
    />
  );
}

function ToggleSwitch({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <div
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        enabled ? "bg-purple-600" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
          enabled ? "translate-x-4" : "translate-x-0"
        )}
      />
    </div>
  );
}

export default function RecordPage() {
  const recorder = useRecorder();
  const { updateRecording, deleteRecording: deleteFromStore, getRecording } = useRecordingsStore();
  const { uploadRecording } = useDriveUpload();
  const { status: authStatus } = useCurrentUser();
  const { pendingAction, clear: clearPendingAction } = usePendingActionStore();
  const [latestStored, setLatestStored] = useState<Recording | null>(null);

  const statusLabel = useMemo(() => {
    if (recorder.isInitializing) return "Starting...";
    if (recorder.status === "countdown") return "Counting down...";
    if (recorder.status === "recording") return "Live Recording";
    if (recorder.status === "paused") return "Paused";
    if (recorder.status === "stopped") return "Stopped";
    if (recorder.status === "error") return "Error";
    return "Ready to Record";
  }, [recorder.isInitializing, recorder.status]);

  const latestArtifact = recorder.artifacts[0];

  // Sync the latest artifact to the stored recording for the post-panel
  useEffect(() => {
    if (latestArtifact && recorder.status === "stopped") {
      const stored = getRecording(latestArtifact.id);
      if (stored) setLatestStored({ ...stored, url: latestArtifact.url });
    }
  }, [latestArtifact, recorder.status, getRecording]);

  // Resume a pending publish action after the OAuth round-trip.
  // Triggered when a guest clicked Publish, signed in, and was sent back here.
  const resumedRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      pendingAction?.type === "publish" &&
      authStatus === "authenticated" &&
      resumedRef.current !== pendingAction.recordingId
    ) {
      resumedRef.current = pendingAction.recordingId;
      const stored = getRecording(pendingAction.recordingId);
      // The recordings store strips blob: URLs on persist, so prefer the
      // in-memory artifact URL (still alive within this tab session) and fall
      // back to the stored record.
      const artifact = recorder.artifacts.find(
        (a) => a.id === pendingAction.recordingId
      );
      const target =
        stored && artifact ? { ...stored, url: artifact.url } : stored;
      if (target) {
        // Fire-and-forget; the UploadButton's dialog surfaces progress/errors.
        void uploadRecording(target);
      }
      clearPendingAction();
    }
  }, [
    pendingAction,
    authStatus,
    getRecording,
    uploadRecording,
    clearPendingAction,
    recorder.artifacts,
  ]);

  const handleRename = (name: string) => {
    if (latestArtifact) {
      updateRecording(latestArtifact.id, { name });
      setLatestStored((prev) => prev ? { ...prev, name } : prev);
    }
  };

  const handleDelete = () => {
    if (latestArtifact) {
      recorder.deleteRecording(latestArtifact.id);
      deleteFromStore(latestArtifact.id);
      recorder.setPreviewUrl(null);
      setLatestStored(null);
    }
  };

  const audioBars = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      const multiplier = i === 0 || i === 5 ? 0.35 : i === 1 || i === 4 ? 0.7 : 1.0;
      return Math.max(4, Math.round(recorder.audioLevel * multiplier * 0.28));
    });
  }, [recorder.audioLevel]);

  const isSetupState = recorder.status === "idle" || recorder.status === "stopped" || recorder.status === "error";
  const isActiveState = recorder.status === "recording" || recorder.status === "paused" || recorder.status === "countdown";

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground mb-3">
            <MonitorPlay className="h-3.5 w-3.5 text-purple-500" />
            Recording Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Recording Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture your screen, webcam, and audio in high definition.
          </p>
        </div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {recorder.status === "countdown" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <div className="relative flex items-center justify-center w-64 h-64">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-4 border-purple-500/20 blur-md"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-4 border-purple-500"
                />
                <motion.div
                  key={recorder.countdownValue}
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="text-9xl font-black bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
                >
                  {recorder.countdownValue}
                </motion.div>
              </div>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 0.8 }}
                className="mt-8 text-sm font-semibold tracking-wider uppercase flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                Capture Starting
              </motion.p>
              <Button
                onClick={recorder.cancelRecording}
                variant="outline"
                className="mt-10 rounded-full"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid w-full items-start gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Setup / Control Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            {isSetupState && !latestStored ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 sm:p-7 flex flex-col shadow-xl"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-500 self-start mb-4">
                  <Sparkles className="h-3 w-3" />
                  Free Online Capture
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight">
                  Capture instantly. Share anywhere.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Record your screen, camera, and audio in high quality — no watermarks, no software.
                </p>

                <div className="mt-6">
                  <SourceSelector
                    value={recorder.settings.source}
                    onChange={(v) => recorder.updateSetting("source", v)}
                  />
                </div>

                {/* Mic / Webcam toggles */}
                <div className="mt-6 border-t border-border/40 pt-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    2. Audio & Video Settings
                  </label>
                  <div className="mt-3 space-y-2">
                    <div
                      onClick={() => recorder.updateSetting("microphone", !recorder.settings.microphone)}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-3.5 cursor-pointer hover:bg-card/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Mic className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Microphone Input</p>
                          <p className="text-[10px] text-muted-foreground">Record voice narration</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={recorder.settings.microphone}
                        onClick={() => {}}
                      />
                    </div>

                    <div
                      onClick={() => recorder.updateSetting("webcam", !recorder.settings.webcam)}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-3.5 cursor-pointer hover:bg-card/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Webcam className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Webcam Overlay</p>
                          <p className="text-[10px] text-muted-foreground">Show facecam bubble</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={recorder.settings.webcam}
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </div>

                {/* Quality Selector */}
                <div className="mt-6 border-t border-border/40 pt-5">
                  <QualitySelector
                    value={recorder.settings.quality}
                    onChange={(v) => recorder.updateSetting("quality", v)}
                  />
                </div>

                {/* Start button */}
                <div className="mt-8">
                  <Button
                    onClick={() => recorder.startRecording(recorder.settings.source)}
                    disabled={recorder.isInitializing}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01]"
                  >
                    {recorder.isInitializing ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Requesting Permissions...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Start Recording
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>

                {recorder.error && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-normal">{recorder.error}</p>
                  </div>
                )}
              </motion.div>
            ) : latestStored && recorder.previewUrl ? (
              /* Post-recording panel */
              <>
                <PostRecordingPanel
                  recording={latestStored}
                  url={recorder.previewUrl}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    recorder.setPreviewUrl(null);
                    setLatestStored(null);
                  }}
                >
                  <MonitorPlay className="h-4 w-4" />
                  Record Another
                </Button>
              </>
            ) : isActiveState ? (
              /* Active recording control panel */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-purple-500/30 bg-card/40 backdrop-blur-xl p-6 sm:p-7 flex flex-col shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      {recorder.status === "recording" && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      )}
                      <span className={cn(
                        "relative inline-flex rounded-full h-3 w-3",
                        recorder.status === "recording" ? "bg-red-500" : "bg-muted-foreground"
                      )} />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">{statusLabel}</span>
                  </div>
                  <div className="font-mono text-2xl font-black tracking-tight">
                    {formatDuration(recorder.duration)}
                  </div>
                </div>

                {recorder.settings.microphone && (
                  <div className="mt-6 bg-muted/30 rounded-2xl border border-border/40 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Volume2 className={cn("h-4 w-4", recorder.status === "recording" && "text-purple-500")} />
                      <span className="text-xs font-semibold">Microphone</span>
                    </div>
                    <div className="flex items-end gap-1 h-6 pr-1">
                      {audioBars.map((height, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: recorder.status === "recording" ? height : 4 }}
                          className="w-1 bg-purple-500 rounded-full"
                          style={{ minHeight: "4px" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status summary */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-semibold capitalize">{recorder.settings.source}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Microphone</span>
                    <span className="font-semibold">{recorder.settings.microphone ? "Active" : "Off"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Webcam</span>
                    <span className="font-semibold">{recorder.settings.webcam ? "On" : "Off"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Quality</span>
                    <span className="font-semibold">{recorder.settings.quality}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {recorder.status === "paused" ? (
                    <Button
                      onClick={recorder.resumeRecording}
                      className="h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold gap-2"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      onClick={recorder.pauseRecording}
                      disabled={recorder.status !== "recording"}
                      variant="outline"
                      className="h-12 rounded-2xl font-bold gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={recorder.stopRecording}
                    className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-lg shadow-red-600/20"
                  >
                    <Square className="h-4 w-4 fill-white" />
                    Stop & Save
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* Tips panel */}
            <div className="rounded-3xl border border-border/40 bg-card/20 p-5 text-xs text-muted-foreground">
              <h4 className="font-bold flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                Did you know?
              </h4>
              <p className="leading-relaxed">
                Browser permissions are requested when you click Start. You can share your entire
                desktop, an app window, or a specific browser tab. Your recordings never leave your
                device unless you upload them.
              </p>
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
            <div className="rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-xl p-5 shadow-xl flex flex-col min-h-[380px] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Film className="h-4 w-4" />
                  <span>Live Preview Monitor</span>
                </div>
                {recorder.status === "recording" && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                )}
              </div>

              <div className="w-full flex-1 min-h-[320px] rounded-[24px] bg-slate-950 border border-border/40 relative overflow-hidden flex flex-col items-center justify-center aspect-video shadow-inner">
                {/* Grid texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

                {recorder.status === "stopped" && recorder.previewUrl ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={recorder.previewUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : isActiveState ? (
                  <div className="relative w-full h-full">
                    {recorder.settings.source === "webcam" ? (
                      <LiveVideo stream={recorder.webcamStream} className="rounded-[24px]" />
                    ) : (
                      <div className="w-full h-full relative">
                        <LiveVideo stream={recorder.screenStream} className="rounded-[24px]" />
                        {recorder.settings.webcam && recorder.webcamStream && (
                          <motion.div
                            drag
                            dragConstraints={{ top: 10, left: 10, right: 350, bottom: 200 }}
                            dragElastic={0.1}
                            dragMomentum={false}
                            className="absolute bottom-4 right-4 z-20 w-32 h-32 rounded-full border-2 border-purple-500 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950 group/webcam"
                          >
                            <LiveVideo stream={recorder.webcamStream} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/webcam:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-bold text-white">Drag Me</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                ) : recorder.settings.webcam && recorder.webcamStream ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {recorder.settings.source === "webcam" ? (
                      <div className="w-full h-full relative">
                        <LiveVideo stream={recorder.webcamStream} className="rounded-[24px]" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-36 h-36 rounded-full border-2 border-purple-500/80 shadow-lg overflow-hidden relative">
                          <LiveVideo stream={recorder.webcamStream} />
                          <div className="absolute bottom-1 inset-x-0 flex justify-center">
                            <span className="bg-purple-600 text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase">
                              Preview
                            </span>
                          </div>
                        </div>
                        <h3 className="mt-4 text-sm font-bold">Camera check</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                          This webcam bubble will float over your screen recording. Drag it anywhere.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-muted-foreground group-hover:border-purple-500/30 transition-all">
                      <VideoOff className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold">Preview idle</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                      Live recording streams will appear here when you start recording.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
