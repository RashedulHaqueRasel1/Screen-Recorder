
import { Camera, Monitor, MonitorSmartphone, Video } from "lucide-react";

export const RECORDER_SOURCE_OPTIONS = [
  {
    value: "screen",
    label: "Screen",
    description: "Record your entire display",
    icon: Monitor,
  },
  {
    value: "tab",
    label: "Tab",
    description: "Capture a browser tab",
    icon: Video,
  },
  {
    value: "window",
    label: "Window",
    description: "Record a single app window",
    icon: MonitorSmartphone,
  },
] as const;

export const RECORDING_QUALITY_OPTIONS = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p" },
] as const;

export const RECORDING_HINTS = [
  "Choose a source",
  "Turn on mic or webcam if needed",
  "Click Start Recording",
] as const;

export const RECORDING_PREVIEW_LABELS = {
  ready: "Ready to preview",
  recording: "Recording in progress",
  paused: "Paused",
  stopped: "Recording saved",
} as const;
