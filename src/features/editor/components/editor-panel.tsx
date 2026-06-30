"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Crop,
  Download,
  Film,
  Loader2,
  Minus,
  Music,
  Pause,
  Pencil,
  Play,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFFmpeg } from "@/features/editor/hooks/use-ffmpeg";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types/recording";

interface EditorPanelProps {
  recording: Recording;
  url: string;
  onRename: (name: string) => void;
}

type ToolTab = "trim" | "volume" | "audio" | "crop" | "split";

export function EditorPanel({ recording, url, onRename }: EditorPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<ToolTab>("trim");

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Volume state
  const [volumeMultiplier, setVolumeMultiplier] = useState(1);

  // Audio state
  const [removeAudioEnabled, setRemoveAudioEnabled] = useState(false);

  // Crop state
  const [cropAspect, setCropAspect] = useState("original");
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  // Split state
  const [splitTime, setSplitTime] = useState(0);

  // Rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(recording.name);

  // FFmpeg
  const ffmpeg = useFFmpeg();

  // Video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
      setSplitTime(Math.floor(video.duration / 2));
    };
    video.addEventListener("loadedmetadata", handleLoaded);
    if (video.readyState >= 1) handleLoaded();
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, []);

  // Time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Thumbnail capture
  const captureThumbnail = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
    // Create a download link
    const a = document.createElement("a");
    a.href = thumbnailUrl;
    a.download = `${recording.name}-thumbnail.jpg`;
    a.click();
  }, [recording.name]);

  // Video dimensions (for crop calculations)
  const videoWidth = videoRef.current?.videoWidth || 1920;
  const videoHeight = videoRef.current?.videoHeight || 1080;

  const cropDimensions = useMemo(() => {
    const vw = videoWidth;
    const vh = videoHeight;
    switch (cropAspect) {
      case "16:9": {
        const h = Math.round(vw * 9 / 16);
        return { w: vw, h, x: 0, y: Math.round((vh - h) / 2) };
      }
      case "4:3": {
        const w = Math.round(vh * 4 / 3);
        return { w: Math.min(w, vw), h: vh, x: Math.round((vw - Math.min(w, vw)) / 2), y: 0 };
      }
      case "1:1": {
        const s = Math.min(vw, vh);
        return { w: s, h: s, x: Math.round((vw - s) / 2), y: Math.round((vh - s) / 2) };
      }
      case "9:16": {
        const w = Math.round(vh * 9 / 16);
        return { w, h: vh, x: Math.round((vw - w) / 2), y: 0 };
      }
      default:
        return { w: vw, h: vh, x: 0, y: 0 };
    }
  }, [cropAspect, videoWidth, videoHeight]);

  // Process & download
  const handleProcessAndDownload = useCallback(async () => {
    if (!url) return;

    try {
      let response = await fetch(url);
      let blob = await response.blob();
      let file = new File([blob], `${recording.name}.webm`, { type: recording.mimeType });

      // Load FFmpeg if not loaded
      if (!ffmpeg.isLoaded) {
        await ffmpeg.load();
      }

      let resultBlob: Blob;

      switch (activeTab) {
        case "trim":
          resultBlob = await ffmpeg.trim(file, trimStart, trimEnd);
          break;
        case "volume":
          resultBlob = await ffmpeg.adjustVolume(file, volumeMultiplier);
          break;
        case "audio":
          resultBlob = await ffmpeg.removeAudio(file);
          break;
        case "crop":
          resultBlob = await ffmpeg.crop(file, cropDimensions.w, cropDimensions.h, cropDimensions.x, cropDimensions.y);
          break;
        case "split": {
          const { part1, part2 } = await ffmpeg.split(file, splitTime);
          downloadBlob(part1, `${recording.name}-part1.webm`);
          downloadBlob(part2, `${recording.name}-part2.webm`);
          return;
        }
        default:
          return;
      }

      downloadBlob(resultBlob, `${recording.name}-edited.webm`);
    } catch (err) {
      console.error("Processing failed:", err);
    }
  }, [url, recording.name, recording.mimeType, ffmpeg, activeTab, trimStart, trimEnd, volumeMultiplier, cropDimensions, splitTime]);

  const handleSaveName = () => {
    if (name.trim()) {
      onRename(name.trim());
    }
    setIsEditingName(false);
  };

  const toolTabs: { id: ToolTab; label: string; icon: typeof Scissors }[] = [
    { id: "trim", label: "Trim", icon: Scissors },
    { id: "volume", label: "Volume", icon: Volume2 },
    { id: "audio", label: "Audio", icon: Music },
    { id: "crop", label: "Crop", icon: Crop },
    { id: "split", label: "Split", icon: Scissors },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden canvas for thumbnail capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Rename bar */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 flex-1"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                />
                <Button size="sm" onClick={handleSaveName}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold truncate">{recording.name}</p>
                <button
                  onClick={() => { setName(recording.name); setIsEditingName(true); }}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={url}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              playsInline
            />

            {/* Play/Pause overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                )}
              </div>
            </button>

            {/* Time display */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-white">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
          </div>

          {/* Timeline scrubber */}
          <div className="p-4">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={(v) => seekTo(v[0])}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-purple-500" />
            Editing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Tool tabs */}
          <div className="flex flex-wrap gap-2">
            {toolTabs.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "gap-1.5 rounded-xl",
                  activeTab === tab.id &&
                    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-xl"
              onClick={captureThumbnail}
            >
              <Film className="h-3.5 w-3.5" />
              Thumbnail
            </Button>
          </div>

          {/* Trim controls */}
          {activeTab === "trim" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-2xl bg-muted/30 border border-border/40 p-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Time</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[trimStart]}
                      min={0}
                      max={Math.max(duration - 1, 1)}
                      step={0.1}
                      onValueChange={(v) => setTrimStart(v[0])}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-12 text-right">{formatDuration(trimStart)}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => seekTo(trimStart)}>
                    Preview
                  </Button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Time</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Slider
                      value={[trimEnd]}
                      min={0.1}
                      max={Math.max(duration, 1)}
                      step={0.1}
                      onValueChange={(v) => setTrimEnd(v[0])}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-12 text-right">{formatDuration(trimEnd)}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => seekTo(trimEnd)}>
                    Preview
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Duration: {formatDuration(trimEnd - trimStart)}
              </p>
            </motion.div>
          )}

          {/* Volume controls */}
          {activeTab === "volume" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-2xl bg-muted/30 border border-border/40 p-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Volume Adjustment
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <VolumeX className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Slider
                    value={[volumeMultiplier]}
                    min={0}
                    max={3}
                    step={0.1}
                    onValueChange={(v) => setVolumeMultiplier(v[0])}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-10 text-right">{volumeMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">0x (mute)</span>
                  <span className="text-[10px] text-muted-foreground">1x (original)</span>
                  <span className="text-[10px] text-muted-foreground">3x (boost)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Audio controls */}
          {activeTab === "audio" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-muted/30 border border-border/40 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    {removeAudioEnabled ? (
                      <VolumeX className="h-4 w-4 text-destructive" />
                    ) : (
                      <Music className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Remove Audio Track</p>
                    <p className="text-xs text-muted-foreground">
                      Strip all audio from the video
                    </p>
                  </div>
                </div>
                <Switch
                  checked={removeAudioEnabled}
                  onCheckedChange={setRemoveAudioEnabled}
                />
              </div>
            </motion.div>
          )}

          {/* Crop controls */}
          {activeTab === "crop" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-2xl bg-muted/30 border border-border/40 p-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio
                </label>
                <Select value={cropAspect} onValueChange={setCropAspect}>
                  <SelectTrigger className="w-full sm:w-48 rounded-xl mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cropAspect !== "original" && (
                <p className="text-xs text-muted-foreground">
                  Output: {cropDimensions.w}×{cropDimensions.h}px
                </p>
              )}
            </motion.div>
          )}

          {/* Split controls */}
          {activeTab === "split" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-2xl bg-muted/30 border border-border/40 p-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Split Point
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <Scissors className="h-4 w-4 text-purple-500 shrink-0" />
                  <Slider
                    value={[splitTime]}
                    min={0.1}
                    max={Math.max(duration - 0.1, 1)}
                    step={0.1}
                    onValueChange={(v) => setSplitTime(v[0])}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-12 text-right">{formatDuration(splitTime)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Part 1: 0:00 – {formatDuration(splitTime)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Part 2: {formatDuration(splitTime)} – {formatDuration(duration)}
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => seekTo(splitTime)}>
                  Preview split point
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* FFmpeg loading state */}
      {ffmpeg.isLoading && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <div>
              <p className="text-sm font-semibold">Loading video editor...</p>
              <p className="text-xs text-muted-foreground">Downloading FFmpeg WASM (first time only)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing state */}
      {ffmpeg.isProcessing && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <p className="text-sm font-semibold">Processing video...</p>
            </div>
            <Progress value={ffmpeg.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{ffmpeg.progress}%</p>
          </CardContent>
        </Card>
      )}

      {/* Processing error */}
      {ffmpeg.processingError && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Processing failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ffmpeg.processingError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FFmpeg load error */}
      {ffmpeg.loadError && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Failed to load editor</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ffmpeg.loadError}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure your browser supports SharedArrayBuffer and you have a stable internet connection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleProcessAndDownload}
          disabled={ffmpeg.isProcessing || ffmpeg.isLoading}
          className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 rounded-2xl"
        >
          {ffmpeg.isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing... {ffmpeg.progress}%
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {activeTab === "split" ? "Split & Download" : "Save Edited Video"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Utility                                                            */
/* ------------------------------------------------------------------ */

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
