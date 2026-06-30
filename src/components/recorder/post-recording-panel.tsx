"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  Construction,
  Download,
  Film,
  HardDrive,
  Link2,
  Pencil,
  Scissors,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/components/drive/upload-button";
import { ShareDialog } from "@/components/drive/share-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes, formatDuration, formatDate } from "@/lib/format";
import { getRecordingFilename } from "@/lib/recording-file";
import { useRecordingsStore } from "@/stores/recordings-store";
import type { Recording } from "@/types/recording";

interface PostRecordingPanelProps {
  recording: Recording;
  url: string;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function PostRecordingPanel({
  recording,
  url,
  onRename,
  onDelete,
}: PostRecordingPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(recording.name);
  const [showEditSoon, setShowEditSoon] = useState(false);
  const current = useRecordingsStore((state) => state.getRecording(recording.id)) ?? recording;
  const isPublished =
    (current.status === "uploaded" || current.status === "shared") &&
    !!(current.shareUrl || current.driveUrl);

  const handleSaveName = () => {
    if (name.trim()) {
      onRename(name.trim());
    }
    setIsEditing(false);
  };

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = getRecordingFilename(recording.name, recording.mimeType);
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 shadow-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5 mb-5">
        <div>
          <div className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5">
            <Check className="h-2.5 w-2.5" />
            Recording Complete
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 max-w-xs"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <Button size="sm" onClick={handleSaveName}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{recording.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Rename"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Duration", value: formatDuration(recording.duration) },
          { icon: HardDrive, label: "Size", value: formatBytes(recording.size) },
          { icon: Film, label: "Resolution", value: recording.resolution || recording.quality },
          { icon: Calendar, label: "Date", value: formatDate(recording.createdAt) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-muted/30 border border-border/40 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <item.icon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold font-mono">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={handleDownload}
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setShowEditSoon(true)}
        >
          <Scissors className="h-4 w-4" />
          Edit Video
        </Button>
        <UploadButton recording={recording} variant="default" label="Publish" showInlineShare={false} />
        {isPublished && (
          <ShareDialog
            recording={current}
            trigger={
              <Button type="button" variant="outline" className="gap-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600">
                <Link2 className="h-4 w-4" />
                Share Link
              </Button>
            }
          />
        )}
        <Button
          onClick={onDelete}
          variant="ghost"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

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
