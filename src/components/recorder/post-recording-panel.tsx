"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  Download,
  Film,
  HardDrive,
  Pencil,
  Scissors,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/components/drive/upload-button";
import { ShareActions } from "@/components/drive/share-actions";
import { ShareDialog } from "@/components/drive/share-dialog";
import { formatBytes, formatDuration, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
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
    a.download = `${recording.name}.webm`;
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
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/editor/${recording.id}`}>
            <Scissors className="h-4 w-4" />
            Edit Video
          </Link>
        </Button>
        <UploadButton recording={recording} variant="default" label="Publish" showInlineShare={false} />
        {(recording.status === "uploaded" || recording.status === "shared") && recording.shareUrl && (
          <ShareDialog recording={recording} />
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

      {/* Share link row — visible immediately after publishing, no navigation needed */}
      {(recording.status === "uploaded" || recording.status === "shared") && recording.shareUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-500">Published — share link ready</p>
                <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                  {recording.shareUrl}
                </p>
              </div>
            </div>
            <ShareActions recording={recording} size="sm" showUrl={false} className="shrink-0" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
