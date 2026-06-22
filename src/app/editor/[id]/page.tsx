"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Film,
  HardDrive,
  Pencil,
  Scissors,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditorPanel } from "@/features/editor/components/editor-panel";
import { UploadButton } from "@/components/drive/upload-button";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatBytes, formatDuration, formatDate } from "@/lib/format";
import type { Recording } from "@/types/recording";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { getRecording, updateRecording, recordings } = useRecordingsStore();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !id) return;
    const rec = getRecording(id);
    setRecording(rec ?? null);
  }, [hydrated, id, getRecording, recordings]);

  const handleRename = (name: string) => {
    if (id) {
      updateRecording(id, { name });
      setRecording((prev) => (prev ? { ...prev, name } : prev));
    }
  };

  // Loading state
  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-muted" />
            <div className="h-64 rounded-3xl bg-muted" />
            <div className="h-32 rounded-3xl bg-muted" />
          </div>
        </div>
      </AppShell>
    );
  }

  // Not found
  if (!recording) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
            <Link href="/history">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Link>
          </Button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-xl font-bold">Recording not found</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              The recording you&apos;re trying to edit may have been deleted, or its
              local data is no longer available.
            </p>
            <Button asChild className="mt-6 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Link href="/history">
                <Film className="h-4 w-4" />
                Browse Recordings
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // No playable URL (blob URL was stripped on persist / page refresh)
  if (!recording.url) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
            <Link href="/history">
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Link>
          </Button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold">Video unavailable for editing</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              This recording&apos;s video file is no longer available in your browser
              session. Recordings can only be edited in the same session they were
              created. Please re-record to edit.
            </p>
            <Button asChild className="mt-6 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Link href="/record">
                <Film className="h-4 w-4" />
                New Recording
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
          <Link href="/history">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground mb-3">
            <Scissors className="h-3.5 w-3.5 text-purple-500" />
            Video Editor
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {recording.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(recording.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatBytes(recording.size)}
                </span>
                <span className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  {recording.resolution || recording.quality}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(recording.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UploadButton recording={recording} variant="outline" size="sm" className="rounded-xl" />
            </div>
          </div>
        </motion.div>

        {/* Editor */}
        <EditorPanel
          recording={recording}
          url={recording.url}
          onRename={handleRename}
        />
      </div>
    </AppShell>
  );
}
