export interface Recording {
  id: string;
  name: string;
  url: string;
  blob?: Blob;
  mimeType: string;
  duration: number;
  size: number;
  resolution: string;
  quality: "720p" | "1080p" | "1440p";
  createdAt: string;
  updatedAt: string;
  status: "local" | "uploaded" | "shared";
  driveFileId?: string;
  driveUrl?: string;
  shareUrl?: string;
  thumbnail?: string;
  hasAudio: boolean;
  hasWebcam: boolean;
  source: "screen" | "window" | "tab" | "webcam";
}

export type RecordingQuality = "720p" | "1080p" | "1440p";
export type RecordingSource = "screen" | "window" | "tab" | "webcam";
export type RecordingStatus = "local" | "uploaded" | "shared";
