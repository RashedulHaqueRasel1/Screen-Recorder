"use client";

import { useCallback, useState } from "react";
import { useDriveStore } from "@/stores/drive-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { uploadToDrive, isTokenValid } from "../services/drive-api";
import type { Recording } from "@/types/recording";

interface UseDriveUploadReturn {
  uploadingId: string | null;
  progress: number;
  error: string | null;
  uploadRecording: (recording: Recording) => Promise<void>;
}

export function useDriveUpload(): UseDriveUploadReturn {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { accessToken, expiresAt } = useDriveStore();
  const { updateRecording } = useRecordingsStore();

  const uploadRecording = useCallback(
    async (recording: Recording) => {
      setError(null);

      if (!accessToken || !isTokenValid(expiresAt)) {
        setError("Google Drive is not connected. Please reconnect your account.");
        return;
      }

      setUploadingId(recording.id);
      setProgress(0);

      try {
        const result = await uploadToDrive(recording, accessToken, (p) => {
          setProgress(p);
        });

        updateRecording(recording.id, {
          status: "shared",
          driveFileId: result.id,
          driveUrl: result.webViewLink,
          shareUrl: result.webViewLink,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploadingId(null);
        setProgress(0);
      }
    },
    [accessToken, expiresAt, updateRecording]
  );

  return { uploadingId, progress, error, uploadRecording };
}
