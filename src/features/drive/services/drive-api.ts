"use client";

import type { Recording } from "@/types/recording";

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
  // If we have a blob URL that's still active
  if (recording.url && recording.url.startsWith("blob:")) {
    try {
      const response = await fetch(recording.url);
      const blob = await response.blob();
      return new File([blob], `${recording.name}.webm`, { type: recording.mimeType });
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

  // Step 1: Start resumable session with metadata
  const metadata = {
    name: `${recording.name}.webm`,
    mimeType: recording.mimeType,
  };

  const sessionResponse = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=resumable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": recording.mimeType,
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

  // Step 2: Upload the file content with progress tracking
  await uploadWithProgress(sessionUrl, file, recording.mimeType, onProgress);

  // Step 3: Get file metadata (link, id)
  const metaResponse = await fetch(`${DRIVE_FILES_URL}?fields=id,name,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  // Fallback: query the file by listing recent
  let result: UploadResult;
  if (metaResponse.ok) {
    const data = await metaResponse.json();
    result = {
      id: data.id,
      name: data.name,
      webViewLink: data.webViewLink,
    };
  } else {
    // Construct from upload session — get the file ID via list
    const listResponse = await fetch(
      `${DRIVE_FILES_URL}?q=name='${encodeURIComponent(metadata.name)}'&fields=files(id,name,webViewLink)&orderBy=createdTime desc&pageSize=1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const listData = await listResponse.json();
    const found = listData.files?.[0];
    if (!found) throw new Error("Upload succeeded but could not retrieve file info.");
    result = { id: found.id, name: found.name, webViewLink: found.webViewLink };
  }

  // Step 4: Make the file shareable (anyone with link can view)
  await makeFileShareable(result.id, accessToken);

  return result;
}

/**
 * Set file permissions so anyone with the link can view.
 */
async function makeFileShareable(fileId: string, accessToken: string): Promise<void> {
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
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
  } catch {
    // Non-fatal — user can manually share
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
): Promise<Response> {
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
        resolve(new Response(xhr.response, { status: xhr.status }));
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
