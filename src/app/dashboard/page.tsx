"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CloudUpload,
  Film,
  HardDrive,
  MonitorPlay,
  Plus,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/common/stats-card";
import { RecordingCard } from "@/components/common/recording-card";
import { EmptyState } from "@/components/common/empty-state";
import { DriveStatus } from "@/components/drive/drive-status";
import { Button } from "@/components/ui/button";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatHours } from "@/lib/format";
import type { Recording } from "@/types/recording";

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { recordings } = useRecordingsStore();
  const [previewRecording, setPreviewRecording] = useState<Recording | null>(null);

  const stats = useMemo(() => {
    const totalRecordings = recordings.length;
    const uploaded = recordings.filter((r) => r.status === "uploaded" || r.status === "shared").length;
    const totalSeconds = recordings.reduce((sum, r) => sum + r.duration, 0);
    const totalSize = recordings.reduce((sum, r) => sum + r.size, 0);
    return { totalRecordings, uploaded, totalSeconds, totalSize };
  }, [recordings]);

  const recent = recordings.slice(0, 6);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Record, edit, and share your screen in seconds.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 gap-2"
          >
            <Link href="/record">
              <Plus className="h-5 w-5" />
              Start Recording
            </Link>
          </Button>
        </div>

        {/* Quick Record Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-8 sm:p-10 mb-8"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-500 mb-3">
                <MonitorPlay className="h-3.5 w-3.5" />
                Quick Record
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ready to capture something amazing?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Choose your source, hit record, and we'll handle the rest. Editing and Drive
                upload are one click away.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-xl shadow-purple-500/30 gap-2 text-base shrink-0"
            >
              <Link href="/record">
                <MonitorPlay className="h-5 w-5" />
                Start Recording
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            label="Total Recordings"
            value={stats.totalRecordings}
            icon={Film}
            color="from-indigo-500 to-blue-500"
            delay={0}
          />
          <StatsCard
            label="Uploaded Files"
            value={stats.uploaded}
            icon={CloudUpload}
            color="from-emerald-500 to-teal-500"
            delay={0.05}
          />
          <StatsCard
            label="Hours Recorded"
            value={formatHours(stats.totalSeconds)}
            icon={Clock}
            color="from-amber-500 to-orange-500"
            delay={0.1}
          />
          <StatsCard
            label="Storage Used"
            value={formatBytesCompact(stats.totalSize)}
            icon={HardDrive}
            color="from-rose-500 to-pink-500"
            delay={0.15}
          />
        </div>

        {/* Recent Recordings & Drive Status */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Recordings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Recent Recordings</h2>
                <p className="text-xs text-muted-foreground">Your latest captures</p>
              </div>
              {recordings.length > 0 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/history">View all</Link>
                </Button>
              )}
            </div>

            {recent.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No recordings yet"
                description="Start your first recording and it will appear here. It's quick and free."
                action={
                  <Button asChild className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Link href="/record">
                      <Plus className="h-4 w-4" />
                      Start Recording
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recent.map((rec, i) => (
                  <RecordingCard
                    key={rec.id}
                    recording={rec}
                    onPreview={setPreviewRecording}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Drive Status Sidebar */}
          <div className="space-y-6">
            <DriveStatus />

            <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Pro Tip</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use keyboard shortcuts to record faster. After uploading to Drive, share links
                are automatically generated for instant collaboration.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href="/history">View History</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewRecording && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewRecording(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewRecording(null)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
            >
              ✕
            </button>
            {previewRecording.url && (
              <video
                src={previewRecording.url}
                controls
                autoPlay
                className="w-full aspect-video bg-black"
              />
            )}
            <div className="p-5">
              <h3 className="font-semibold">{previewRecording.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatHours(previewRecording.duration)} • {previewRecording.quality}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}

function formatBytesCompact(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}
