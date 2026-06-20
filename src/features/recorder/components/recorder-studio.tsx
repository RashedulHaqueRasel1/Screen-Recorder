"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Download,
  Pause,
  Play,
  Square,
  Video,
  Mic,
  Monitor,
  Webcam,
  CircleDot,
  Trash2,
  Sparkles,
  X,
  Volume2,
  VideoOff,
  AlertCircle,
  Film,
} from "lucide-react";
import { useMemo, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes, formatDuration } from "../utils/format";
import { useRecorder } from "../hooks/use-recorder";

// Source options for setup
const sourceOptions = [
  { value: "screen", label: "Entire Screen", icon: Monitor, desc: "Record your whole desktop screen" },
  { value: "window", label: "Window", icon: Square, desc: "Record a specific app window" },
  { value: "tab", label: "Browser Tab", icon: CircleDot, desc: "Record a single browser tab" },
  { value: "webcam", label: "Webcam Only", icon: Webcam, desc: "Record your face/camera only" },
] as const;

interface LiveVideoProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

// Reusable component to render a live media stream
function LiveVideo({ stream, muted = true, className = "" }: LiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    
    const playVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
      } catch (err) {
        console.error("Autoplay/play failed for LiveVideo:", err);
      }
    };
    
    playVideo();

    const handleTrackEvent = () => {
      playVideo();
    };
    
    stream.addEventListener("addtrack", handleTrackEvent);
    stream.addEventListener("removetrack", handleTrackEvent);

    return () => {
      stream.removeEventListener("addtrack", handleTrackEvent);
      stream.removeEventListener("removetrack", handleTrackEvent);
      if (video) {
        video.srcObject = null;
      }
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

export function RecorderStudio() {
  const recorder = useRecorder();
  const [activeTab, setActiveTab] = useState<"record" | "library">("record");

  const statusLabel = useMemo(() => {
    if (recorder.isInitializing) return "Starting...";
    if (recorder.status === "countdown") return "Counting down...";
    if (recorder.status === "recording") return "Live Recording";
    if (recorder.status === "paused") return "Recording Paused";
    if (recorder.status === "stopped") return "Recording Stopped";
    if (recorder.status === "error") return "Error Occurred";
    return "Ready to Record";
  }, [recorder.isInitializing, recorder.status]);

  const latestArtifact = recorder.artifacts[0];

  const handleDownload = (artifact = latestArtifact) => {
    if (!artifact) return;

    const link = document.createElement("a");
    link.href = artifact.url;
    link.download = `${artifact.name}-${new Date(artifact.createdAt)
      .toISOString()
      .replace(/[:.]/g, "-")}.webm`;
    link.click();
  };

  // Sound bars helper based on audio level
  const audioBars = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      const multiplier = i === 0 || i === 5 ? 0.35 : i === 1 || i === 4 ? 0.7 : 1.0;
      const height = Math.max(
        4,
        Math.round(recorder.audioLevel * multiplier * 0.28)
      );
      return height;
    });
  }, [recorder.audioLevel]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans flex flex-col">
      {/* Decorative Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Fixed Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-slate-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 text-white">
              <Video className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
                RecStudio
              </p>
              <p className="text-xs text-slate-500 font-medium">Loom-style Screen Recorder</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("record")}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
                activeTab === "record"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Recorder
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
                activeTab === "library"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Library
              {recorder.artifacts.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {recorder.artifacts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex-1 flex flex-col relative z-10">

        {/* 3-Second Countdown Overlay */}
        <AnimatePresence>
          {recorder.status === "countdown" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/45 backdrop-blur-[3px]"
            >
              <div className="relative flex items-center justify-center w-64 h-64">
                {/* Glowing ring animation */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-4 border-indigo-500/20 blur-md"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-4 border-indigo-500"
                />
                
                {/* Countdown numbers */}
                <motion.div
                  key={recorder.countdownValue}
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 drop-shadow-[0_10px_35px_rgba(99,102,241,0.4)]"
                >
                  {recorder.countdownValue}
                </motion.div>
              </div>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 0.8 }}
                className="mt-8 text-slate-300 text-sm font-semibold tracking-wider uppercase flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                Capture Starting Soon
              </motion.p>
              
              <Button
                onClick={recorder.cancelRecording}
                variant="outline"
                className="mt-12 rounded-full border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                Cancel Setup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Interface Router */}
        <div className="flex-1 flex flex-col">
          {activeTab === "record" ? (
            /* Setup and Active Recording Screen */
            <div className="grid w-full items-start gap-8 lg:grid-cols-12 lg:gap-12 flex-1">
              
              {/* Setup Panel / Active Control Block */}
              <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
                
                {recorder.status === "idle" || recorder.status === "stopped" || recorder.status === "error" ? (
                  /* IDLE / SETUP INTERFACE */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-slate-900 bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8 flex flex-col shadow-xl"
                  >
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 self-start">
                      <Sparkles className="h-3 w-3" />
                      Free Online Capture
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      Capture instantly. Share anywhere.
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Record your screen, camera, and audio in high definition without watermarks or software installation.
                    </p>

                    {/* Source Selector */}
                    <div className="mt-6">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        1. Select Capture Source
                      </label>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {sourceOptions.map((option) => {
                          const Icon = option.icon;
                          const selected = recorder.settings.source === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => recorder.updateSetting("source", option.value)}
                              className={cn(
                                "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 group relative overflow-hidden",
                                selected
                                  ? "border-indigo-500/80 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-white"
                                  : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-200"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                  selected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                                )}
                              >
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold tracking-tight">{option.label}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                  {option.desc}
                                </p>
                              </div>
                              {selected && (
                                <div className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-indigo-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Devices Toggle Switches */}
                    <div className="mt-6 border-t border-slate-900 pt-5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        2. Audio & Video Settings
                      </label>
                      <div className="mt-3 space-y-2">
                        {/* Mic Switch */}
                        <div
                          onClick={() =>
                            recorder.updateSetting("microphone", !recorder.settings.microphone)
                          }
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all",
                            recorder.settings.microphone
                              ? "border-slate-800 bg-slate-900/60"
                              : "border-slate-900 bg-slate-950/20 opacity-60 hover:opacity-85"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                              <Mic className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">Microphone Input</p>
                              <p className="text-[10px] text-slate-500">Record your voice narration</p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                              recorder.settings.microphone ? "bg-indigo-600" : "bg-slate-800"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                recorder.settings.microphone ? "translate-x-4" : "translate-x-0"
                              )}
                            />
                          </div>
                        </div>

                        {/* Webcam Switch */}
                        <div
                          onClick={() =>
                            recorder.updateSetting("webcam", !recorder.settings.webcam)
                          }
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all",
                            recorder.settings.webcam
                              ? "border-slate-800 bg-slate-900/60"
                              : "border-slate-900 bg-slate-950/20 opacity-60 hover:opacity-85"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                              <Webcam className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">Webcam Overlay</p>
                              <p className="text-[10px] text-slate-500">Show facecam bubble</p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                              recorder.settings.webcam ? "bg-indigo-600" : "bg-slate-800"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                recorder.settings.webcam ? "translate-x-4" : "translate-x-0"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Start Action */}
                    <div className="mt-8">
                      <Button
                        onClick={() => recorder.startRecording(recorder.settings.source)}
                        disabled={recorder.isInitializing}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-500/35"
                      >
                        {recorder.isInitializing ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Requesting Capture Permissions...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Start Recording
                            <ArrowRight className="h-4.5 w-4.5" />
                          </span>
                        )}
                      </Button>
                    </div>

                    {recorder.error && (
                      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-300 text-xs">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                        <p className="leading-normal">{recorder.error}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* LIVE RECORDING HUD (active status card) */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 flex flex-col shadow-xl shadow-indigo-500/5 relative overflow-hidden"
                  >
                    {/* Flashing border line indicator */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 animate-pulse" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className={cn(
                            "absolute inline-flex h-full w-full rounded-full opacity-75",
                            recorder.status === "recording" ? "animate-ping bg-rose-500" : "bg-slate-500"
                          )}></span>
                          <span className={cn(
                            "relative inline-flex rounded-full h-3 w-3",
                            recorder.status === "recording" ? "bg-rose-500" : "bg-slate-500"
                          )}></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          {statusLabel}
                        </span>
                      </div>
                      <div className="font-mono text-2xl font-black tracking-tight text-white">
                        {formatDuration(recorder.duration)}
                      </div>
                    </div>

                    {/* Microphone waveform indicator */}
                    {recorder.settings.microphone && (
                      <div className="mt-6 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Volume2 className={cn("h-4 w-4", recorder.status === "recording" && "text-indigo-400")} />
                          <span className="text-xs font-semibold">Microphone Audio</span>
                        </div>
                        
                        <div className="flex items-end gap-1 h-6 pr-1">
                          {audioBars.map((height, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: recorder.status === "recording" ? height : 4 }}
                              className="w-1 bg-indigo-500 rounded-full"
                              style={{ minHeight: "4px" }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recording status summaries */}
                    <div className="mt-5 space-y-2 text-xs text-slate-400">
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span>Source Type</span>
                        <span className="font-semibold text-white capitalize">{recorder.settings.source}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span>Microphone Input</span>
                        <span className="font-semibold text-white">
                          {recorder.settings.microphone ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Webcam Feed</span>
                        <span className="font-semibold text-white">
                          {recorder.settings.webcam ? "Floating Bubble" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    {/* Highly visible Pause, Resume, Stop Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {recorder.status === "paused" ? (
                        <Button
                          onClick={recorder.resumeRecording}
                          className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                        >
                          <Play className="h-4.5 w-4.5 fill-white" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={recorder.pauseRecording}
                          disabled={recorder.status !== "recording"}
                          variant="outline"
                          className="h-12 rounded-2xl border-slate-800 bg-slate-950/20 text-slate-200 hover:bg-slate-800 hover:text-white font-bold flex items-center justify-center gap-2"
                        >
                          <Pause className="h-4.5 w-4.5 fill-slate-200" />
                          Pause
                        </Button>
                      )}

                      <Button
                        onClick={recorder.stopRecording}
                        className="h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 animate-pulse-slow"
                      >
                        <Square className="h-4 w-4 fill-white" />
                        Stop / Save
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Helpful tips panel */}
                <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-5 text-xs text-slate-400">
                  <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Did you know?
                  </h4>
                  <p className="mt-2 leading-relaxed">
                    Browser permissions are requested when you click Start. You can select to share your entire desktop, a single application window, or a specific browser tab.
                  </p>
                </div>

              </div>

              {/* Live Preview Area Column */}
              <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
                
                {/* Live Preview Main Card */}
                <div className="rounded-[32px] border border-slate-900 bg-slate-900/20 backdrop-blur-xl p-5 shadow-xl flex flex-col min-h-[380px] relative overflow-hidden group">
                  
                  {/* Card Header Label */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Film className="h-4 w-4" />
                      <span>Live Preview Monitor</span>
                    </div>
                    {recorder.status === "recording" && (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
                        Capture active
                      </span>
                    )}
                  </div>

                  {/* Monitor Screen Frame */}
                  <div className="w-full flex-1 min-h-[320px] rounded-[24px] bg-slate-950 border border-slate-900/60 relative overflow-hidden flex flex-col items-center justify-center aspect-video shadow-inner">
                    
                    {/* Background grid texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none" />

                    {/* LIVE VIEW ROUTING */}
                    {recorder.status === "stopped" && recorder.previewUrl ? (
                      /* Recorded Video Player Preview */
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video 
                          src={recorder.previewUrl} 
                          controls 
                          className="w-full h-full object-contain rounded-[24px]" 
                          autoPlay
                        />
                      </div>
                    ) : recorder.status === "recording" || recorder.status === "paused" || recorder.status === "countdown" ? (
                      /* Live Screen Capture Stream */
                      <div className="relative w-full h-full">
                        {recorder.settings.source === "webcam" ? (
                          /* Webcam Only Mode - Main Screen */
                          <LiveVideo stream={recorder.webcamStream} className="rounded-[24px]" />
                        ) : (
                          /* Screen Capture Stream - Main Screen */
                          <div className="w-full h-full relative">
                            <LiveVideo stream={recorder.screenStream} className="rounded-[24px]" />
                            
                            {/* Floating Webcam Overlay Bubble (Loom Style) */}
                            {recorder.settings.webcam && recorder.webcamStream && (
                              <motion.div
                                drag
                                dragConstraints={{ top: 10, left: 10, right: 350, bottom: 200 }}
                                dragElastic={0.1}
                                dragMomentum={false}
                                className="absolute bottom-4 right-4 z-20 w-32 h-32 rounded-full border-2 border-indigo-500 shadow-xl overflow-hidden cursor-grab active:cursor-grabbing group/webcam bg-slate-950"
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
                      /* Setup Mode Camera Check Feed */
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-900/20">
                        {recorder.settings.source === "webcam" ? (
                          /* Webcam only preview size */
                          <div className="w-full h-full relative">
                            <LiveVideo stream={recorder.webcamStream} className="rounded-[24px]" />
                            <div className="absolute top-4 left-4 rounded-xl bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-indigo-400">
                              Webcam Only Setup View
                            </div>
                          </div>
                        ) : (
                          /* Small Cam-check Window Overlay in Mock Screen */
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-36 h-36 rounded-full border-2 border-indigo-500/80 shadow-lg shadow-indigo-500/10 overflow-hidden relative">
                              <LiveVideo stream={recorder.webcamStream} />
                              <div className="absolute bottom-1 inset-x-0 flex justify-center">
                                <span className="bg-indigo-600 text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase">
                                  Live Preview
                                </span>
                              </div>
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-white">Camera alignment check</h3>
                            <p className="mt-1 text-xs text-slate-500 max-w-xs leading-normal">
                              This circular webcam bubble will float in the corner of your screen share recording. You can drag it anywhere.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Idle Placeholder Screen */
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800 group-hover:border-indigo-500/30 group-hover:bg-slate-900/80 transition-all duration-300">
                          <VideoOff className="h-6 w-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="mt-4 text-sm font-bold text-white">Capture viewport idle</p>
                        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-normal">
                          Live recording streams and camera bubbles will render here when you start recording.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest Capture Preview Panel (Stopped State) */}
                <AnimatePresence>
                  {recorder.previewUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="rounded-[32px] border border-slate-900 bg-slate-900/30 backdrop-blur-xl p-6 shadow-xl flex flex-col"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-5 mb-5">
                        <div>
                          <div className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            Ready to download
                          </div>
                          <h3 className="mt-1 text-lg font-bold text-white">
                            Your latest capture file
                          </h3>
                        </div>
                        <div className="text-xs text-slate-400 text-left sm:text-right font-medium">
                          <p>Duration: <span className="font-mono text-white">{formatDuration(latestArtifact?.duration ?? recorder.duration)}</span></p>
                          <p className="mt-0.5">Size: <span className="font-mono text-white">{formatBytes(latestArtifact?.size ?? 0)}</span></p>
                        </div>
                      </div>
                      {/* Live preview has been replaced inside the main monitor frame */}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleDownload()}
                          className="h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 px-6"
                        >
                          <Download className="h-4.5 w-4.5" />
                          Download WebM Video
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          ) : (
            /* LIBRARY VIEW (past recording gallery) */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Recordings library</h2>
                  <p className="text-xs text-slate-500">View and manage your locally stored video capture files</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl font-medium">
                  Total Files: <span className="text-indigo-400 font-bold">{recorder.artifacts.length}</span>
                </div>
              </div>

              {recorder.artifacts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border border-dashed border-slate-850 rounded-[32px] min-h-[300px]">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 mb-4">
                    <Film className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No recordings found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                    Start recording from the Recorder tab. Once you save or stop a recording, it will appear here.
                  </p>
                  <Button
                    onClick={() => setActiveTab("record")}
                    className="mt-5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white px-4 text-xs font-semibold"
                  >
                    Go to Recorder
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recorder.artifacts.map((artifact) => (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800/80 p-4 flex flex-col transition-all duration-200 group relative"
                    >
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden border border-slate-900 flex items-center justify-center relative">
                        <video src={artifact.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              recorder.setPreviewUrl(artifact.url);
                              setActiveTab("record");
                            }}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow"
                          >
                            <Play className="h-4 w-4 fill-white" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{artifact.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Saved {new Date(artifact.createdAt).toLocaleDateString()} at{" "}
                            {new Date(artifact.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex gap-2">
                            <span>{formatDuration(artifact.duration)}</span>
                            <span>•</span>
                            <span>{formatBytes(artifact.size)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(artifact)}
                              className="p-1.5 rounded-md hover:bg-slate-850 hover:text-white transition-colors"
                              title="Download video"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => recorder.deleteRecording(artifact.id)}
                              className="p-1.5 rounded-md hover:bg-slate-850 hover:text-rose-400 transition-colors text-slate-500"
                              title="Delete recording"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer info features bar */}
        <section className="grid gap-4 mt-12 py-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/10 p-4 border border-slate-900/50">
            <p className="text-xs font-bold text-white">Full Privacy</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Your video recordings are processed directly in your web browser. Nothing is uploaded to external servers.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/10 p-4 border border-slate-900/50">
            <p className="text-xs font-bold text-white">Instant Exports</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Download your recordings instantly in standard WebM format as soon as you stop capture.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/10 p-4 border border-slate-900/50">
            <p className="text-xs font-bold text-white">High Quality</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Uses high-fidelity audio inputs and video frame rates directly supported by your operating system.
            </p>
          </div>
        </section>

      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-md border-t border-slate-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} RecStudio. All rights reserved.</div>
          <div className="flex items-center gap-1.5 text-indigo-400/80 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Local Browser Storage (100% Private)
          </div>
        </div>
      </footer>
    </main>
  );
}
