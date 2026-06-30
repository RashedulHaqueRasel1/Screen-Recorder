"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface UseFFmpegReturn {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  progress: number;
  isProcessing: boolean;
  processingError: string | null;
  load: () => Promise<void>;
  trim: (inputFile: File, startTime: number, endTime: number, onProgress?: (p: number) => void) => Promise<Blob>;
  adjustVolume: (inputFile: File, volumeMultiplier: number, onProgress?: (p: number) => void) => Promise<Blob>;
  removeAudio: (inputFile: File, onProgress?: (p: number) => void) => Promise<Blob>;
  crop: (inputFile: File, width: number, height: number, x: number, y: number, onProgress?: (p: number) => void) => Promise<Blob>;
  split: (inputFile: File, splitTime: number, onProgress?: (p: number) => void) => Promise<{ part1: Blob; part2: Blob }>;
}

const BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

function toBlobPart(data: string | Uint8Array): BlobPart {
  return typeof data === "string" ? data : new Uint8Array(data);
}

export function useFFmpeg(): UseFFmpegReturn {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const getFFmpeg = useCallback(() => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    return ffmpegRef.current;
  }, []);

  const load = useCallback(async () => {
    const ffmpeg = getFFmpeg();
    if (ffmpeg.loaded) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setIsLoaded(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load FFmpeg");
    } finally {
      setIsLoading(false);
    }
  }, [getFFmpeg]);

  const writeAndProcess = useCallback(
    async (
      inputFile: File,
      outputFilename: string,
      buildArgs: (input: string, output: string) => string[],
      onProgress?: (p: number) => void,
    ): Promise<Blob> => {
      const ffmpeg = getFFmpeg();
      const inputName = `input.${inputFile.name.split(".").pop() || "webm"}`;

      setIsProcessing(true);
      setProcessingError(null);
      setProgress(0);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

        // Set up progress callback
        const handleProgress = ({ progress: p }: { progress: number; time: number }) => {
          const pct = Math.round(p * 100);
          setProgress(pct);
          onProgress?.(pct);
        };
        ffmpeg.on("progress", handleProgress);

        const args = buildArgs(inputName, outputFilename);
        await ffmpeg.exec(args);

        ffmpeg.off("progress", handleProgress);

        const data = await ffmpeg.readFile(outputFilename);
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputFilename);

        const blobData = toBlobPart(data);
        return new Blob([blobData], { type: `video/${outputFilename.split(".").pop() || "webm"}` });
      } catch (err) {
        setProcessingError(err instanceof Error ? err.message : "Processing failed");
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [getFFmpeg],
  );

  const trim = useCallback(
    async (inputFile: File, startTime: number, endTime: number, onProgress?: (p: number) => void): Promise<Blob> => {
      return writeAndProcess(
        inputFile,
        "trimmed.webm",
        (input, output) => ["-ss", String(startTime), "-i", input, "-to", String(endTime - startTime), "-c", "copy", output],
        onProgress,
      );
    },
    [writeAndProcess],
  );

  const adjustVolume = useCallback(
    async (inputFile: File, volumeMultiplier: number, onProgress?: (p: number) => void): Promise<Blob> => {
      return writeAndProcess(
        inputFile,
        "adjusted.webm",
        (input, output) => ["-i", input, "-af", `volume=${volumeMultiplier}`, output],
        onProgress,
      );
    },
    [writeAndProcess],
  );

  const removeAudio = useCallback(
    async (inputFile: File, onProgress?: (p: number) => void): Promise<Blob> => {
      return writeAndProcess(
        inputFile,
        "noaudio.webm",
        (input, output) => ["-i", input, "-an", output],
        onProgress,
      );
    },
    [writeAndProcess],
  );

  const crop = useCallback(
    async (inputFile: File, width: number, height: number, x: number, y: number, onProgress?: (p: number) => void): Promise<Blob> => {
      return writeAndProcess(
        inputFile,
        "cropped.webm",
        (input, output) => ["-i", input, "-vf", `crop=${width}:${height}:${x}:${y}`, "-c:a", "copy", output],
        onProgress,
      );
    },
    [writeAndProcess],
  );

  const split = useCallback(
    async (inputFile: File, splitTime: number, onProgress?: (p: number) => void): Promise<{ part1: Blob; part2: Blob }> => {
      const ffmpeg = getFFmpeg();
      const inputName = `input.${inputFile.name.split(".").pop() || "webm"}`;

      setIsProcessing(true);
      setProcessingError(null);
      setProgress(0);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

        const handleProgress = ({ progress: p }: { progress: number; time: number }) => {
          const pct = Math.round(p * 100);
          setProgress(pct);
          onProgress?.(pct);
        };
        ffmpeg.on("progress", handleProgress);

        // Part 1: from start to splitTime
        await ffmpeg.exec(["-i", inputName, "-to", String(splitTime), "-c", "copy", "part1.webm"]);

        // Part 2: from splitTime to end
        await ffmpeg.exec(["-i", inputName, "-ss", String(splitTime), "-c", "copy", "part2.webm"]);

        ffmpeg.off("progress", handleProgress);

        const part1Data = await ffmpeg.readFile("part1.webm");
        const part2Data = await ffmpeg.readFile("part2.webm");

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile("part1.webm");
        await ffmpeg.deleteFile("part2.webm");

        return {
          part1: new Blob([toBlobPart(part1Data)], { type: "video/webm" }),
          part2: new Blob([toBlobPart(part2Data)], { type: "video/webm" }),
        };
      } catch (err) {
        setProcessingError(err instanceof Error ? err.message : "Processing failed");
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [getFFmpeg],
  );

  return {
    isLoaded,
    isLoading,
    loadError,
    progress,
    isProcessing,
    processingError,
    load,
    trim,
    adjustVolume,
    removeAudio,
    crop,
    split,
  };
}
