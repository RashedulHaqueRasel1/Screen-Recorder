export function getRecordingExtension(mimeType?: string): "mp4" | "webm" {
  return mimeType?.toLowerCase().includes("mp4") ? "mp4" : "webm";
}

export function getRecordingFilename(name: string, mimeType?: string): string {
  return `${name}.${getRecordingExtension(mimeType)}`;
}

export function getUploadMimeType(mimeType?: string): string {
  return getRecordingExtension(mimeType) === "mp4" ? "video/mp4" : "video/webm";
}
