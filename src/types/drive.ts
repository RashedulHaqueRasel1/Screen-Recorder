export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
  createdTime?: string;
}

export interface DriveUploadProgress {
  isUploading: boolean;
  progress: number;
  recordingId?: string;
}
