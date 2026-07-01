"use client";

import type { Recording } from "@/types/recording";
import { getRecordingFilename, getUploadMimeType } from "@/lib/recording-file";

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

interface UploadResult {
  id: string;
  name: string;
  webViewLink: string;
}

/**
 * Convert a blob URL or stored recording into a File for upload.
 */
async function recordingToFile(recording: Recording): Promise<File | null> {
  if (recording.blob) {
    const mimeType = getUploadMimeType(recording.mimeType || recording.blob.type);
    return new File([recording.blob], getRecordingFilename(recording.name, mimeType), {
      type: mimeType,
    });
  }

  // If we have a blob URL that's still active
  if (recording.url && recording.url.startsWith("blob:")) {
    try {
      const response = await fetch(recording.url);
      const blob = await response.blob();
      const mimeType = getUploadMimeType(recording.mimeType || blob.type);
      return new File([blob], getRecordingFilename(recording.name, mimeType), {
        type: mimeType,
      });
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Upload a recording to Google Drive using the resumable upload protocol.
 * Reports progress via the onProgress callback.
 */
export async function uploadToDrive(
  recording: Recording,
  accessToken: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const file = await recordingToFile(recording);
  if (!file) {
    throw new Error("Recording file is no longer available. Please re-record.");
  }
  const uploadMimeType = file.type || getUploadMimeType(recording.mimeType);

  // Step 1: Start resumable session with metadata
  const metadata = {
    name: getRecordingFilename(recording.name, uploadMimeType),
    mimeType: uploadMimeType,
  };

  const uploadParams = new URLSearchParams({
    uploadType: "resumable",
    fields: "id,name,webViewLink",
  });

  const sessionResponse = await fetch(`${DRIVE_UPLOAD_URL}?${uploadParams}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": uploadMimeType,
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify(metadata),
  });

  if (!sessionResponse.ok) {
    const errorText = await sessionResponse.text();
    throw new Error(`Drive upload failed: ${sessionResponse.status} ${errorText}`);
  }

  const sessionUrl = sessionResponse.headers.get("location");
  if (!sessionUrl) {
    throw new Error("Failed to get upload session URL from Drive.");
  }

  // Step 2: Upload the file content with progress tracking. The final response
  // is the uploaded Drive file; do not create a second empty file for metadata.
  const result = await uploadWithProgress(sessionUrl, file, uploadMimeType, onProgress);

  // Step 3: Make the file shareable (anyone with link can view)
  await makeFileShareable(result.id, accessToken);

  return result;
}

/**
 * Set file permissions so anyone with the link can view.
 */
async function makeFileShareable(fileId: string, accessToken: string): Promise<void> {
  const response = await fetch(`${DRIVE_FILES_URL}/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload succeeded, but sharing failed: ${response.status} ${errorText}`);
  }
}

/**
 * Upload a chunked file with progress reporting using ReadableStream.
 */
function uploadWithProgress(
  url: string,
  file: File,
  mimeType: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (!data.id) {
            reject(new Error("Upload succeeded but Drive did not return a file ID."));
            return;
          }

          resolve({
            id: data.id,
            name: data.name || file.name,
            webViewLink: data.webViewLink || generateShareUrl(data.id),
          });
        } catch {
          reject(new Error("Upload succeeded but Drive returned invalid file metadata."));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new Error("Upload aborted."));

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.send(file);
  });
}

/**
 * Generate the public share URL for a Drive file.
 */
export function generateShareUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Check if the access token is still valid.
 */
export function isTokenValid(expiresAt: number | null): boolean {
  if (!expiresAt) return false;
  return Date.now() < expiresAt;
}
