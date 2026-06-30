"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Construction,
  Download,
  Film,
  HardDrive,
  Link2,
  MoreVertical,
  Play,
  Plus,
  Scissors,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadButton } from "@/components/drive/upload-button";
import { ShareDialog } from "@/components/drive/share-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatBytes, formatDuration, formatDate } from "@/lib/format";
import { getRecordingFilename } from "@/lib/recording-file";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types/recording";

type FilterTab = "all" | "local" | "published";

export default function HistoryPage() {
  const { recordings, deleteRecording } = useRecordingsStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [previewRecording, setPreviewRecording] = useState<Recording | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recording | null>(null);

  const filtered = useMemo(() => {
    let list = recordings;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }

    // Filter by status
    if (filter === "local") {
      list = list.filter((r) => r.status === "local");
    } else if (filter === "published") {
      list = list.filter((r) => r.status === "uploaded" || r.status === "shared");
    }

    return list;
  }, [recordings, search, filter]);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteRecording(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleDownload = (rec: Recording) => {
    if (!rec.url) return;
    const a = document.createElement("a");
    a.href = rec.url;
    a.download = getRecordingFilename(rec.name, rec.mimeType);
    a.click();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground mb-3">
              <Clock className="h-3.5 w-3.5 text-purple-500" />
              History
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Recording History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {recordings.length} recording{recordings.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 gap-2"
          >
            <Link href="/record">
              <Plus className="h-5 w-5" />
              New Recording
            </Link>
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterTab)}
          >
            <TabsList className="rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-4">
                All
              </TabsTrigger>
              <TabsTrigger value="local" className="rounded-lg px-4">
                Local
              </TabsTrigger>
              <TabsTrigger value="published" className="rounded-lg px-4">
                Published
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recordings List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Film}
            title={search || filter !== "all" ? "No recordings found" : "No recordings yet"}
            description={
              search || filter !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Start your first recording and it will appear here."
            }
            action={
              !(search || filter !== "all") ? (
                <Button asChild className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <Link href="/record">
                    <Plus className="h-4 w-4" />
                    Start Recording
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((rec, i) => (
              <HistoryRow
                key={rec.id}
                recording={rec}
                index={i}
                onPreview={setPreviewRecording}
                onDelete={setDeleteTarget}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewRecording(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewRecording(null)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {previewRecording.url ? (
                <video
                  src={previewRecording.url}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Video preview not available — the recording may need to be re-recorded.
                  </p>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold">{previewRecording.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(previewRecording.duration)} • {previewRecording.resolution || previewRecording.quality} • {formatDate(previewRecording.createdAt)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Recording
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* History Row — a single recording row in the history list             */
/* ------------------------------------------------------------------ */

interface HistoryRowProps {
  recording: Recording;
  index: number;
  onPreview: (rec: Recording) => void;
  onDelete: (rec: Recording) => void;
  onDownload: (rec: Recording) => void;
}

function HistoryRow({ recording, index, onPreview, onDelete, onDownload }: HistoryRowProps) {
  const [showEditSoon, setShowEditSoon] = useState(false);
  const statusConfig = {
    local: { label: "Local", className: "bg-black/70 text-white" },
    uploaded: { label: "Uploaded", className: "bg-indigo-500/90 text-white" },
    shared: { label: "Shared", className: "bg-emerald-500/90 text-white" },
  };

  const status = statusConfig[recording.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Card className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl hover:border-border/80 transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5">
            {/* Thumbnail */}
            <div
              className="relative shrink-0 w-full sm:w-48 aspect-video rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden cursor-pointer"
              onClick={() => onPreview(recording)}
            >
              {recording.url ? (
                <video
                  src={recording.url}
                  className="h-full w-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-1.5 right-1.5">
                <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm gap-1 text-[10px]">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(recording.duration)}
                </Badge>
              </div>

              {/* Status badge */}
              <div className="absolute top-1.5 left-1.5">
                <Badge variant="secondary" className={cn("backdrop-blur-sm text-[10px]", status.className)}>
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{recording.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(recording.createdAt)}</p>
                  </div>

                  {/* Mobile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onPreview(recording)}>
                        <Play className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditSoon(true)}>
                        <Scissors className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(recording)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(recording)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Metadata pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted/40 border border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(recording.size)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted/40 border border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <Film className="h-3 w-3" />
                    {recording.resolution || recording.quality}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted/40 border border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(recording.duration)}
                  </span>
                  {recording.hasAudio && (
                    <span className="inline-flex items-center rounded-lg bg-muted/40 border border-border/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                      Audio
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl text-xs"
                  onClick={() => onPreview(recording)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl text-xs"
                  onClick={() => onDownload(recording)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl text-xs"
                  onClick={() => setShowEditSoon(true)}
                >
                  <Scissors className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <UploadButton
                  recording={recording}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  showInlineShare={false}
                />
                {(recording.status === "uploaded" || recording.status === "shared") && recording.shareUrl && (
                  <ShareDialog
                    recording={recording}
                    trigger={
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-xl border-emerald-500/30 text-xs text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Share Link
                      </Button>
                    }
                  />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 rounded-xl text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={() => onDelete(recording)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showEditSoon} onOpenChange={setShowEditSoon}>
        <DialogContent className="max-w-sm overflow-hidden border-border/60 p-0">
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 pb-5 pt-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/25">
              <Construction className="h-5 w-5" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Coming soon</DialogTitle>
              <DialogDescription>
                Video editing is being worked on and will be available soon.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-2">
            <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Trim, polish, and export tools are on the roadmap. For now, your
              original recording stays safe and ready to download or publish.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
