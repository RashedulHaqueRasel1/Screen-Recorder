
export type RecorderSource = "screen" | "window" | "tab" | "webcam";
export type RecorderStatus = "idle" | "countdown" | "recording" | "paused" | "stopped" | "error";
export type RecordingQuality = "720p" | "1080p" | "1440p";

export interface RecorderSettings {
  source: RecorderSource;
  microphone: boolean;
  webcam: boolean;
  systemAudio: boolean;
  quality: RecordingQuality;
}

export interface RecordingArtifact {
  id: string;
  name: string;
  createdAt: string;
  duration: number;
  size: number;
  url: string;
  mimeType: string;
}
