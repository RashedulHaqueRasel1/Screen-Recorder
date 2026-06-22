"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Download,
  ExternalLink,
  HardDrive,
  Link2,
  MoreVertical,
  Play,
  Scissors,
  Share2,
  Trash2,
  CloudUpload,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/components/drive/upload-button";
import { ShareDialog } from "@/components/drive/share-dialog";
import { useRecordingsStore } from "@/stores/recordings-store";
import { formatBytes, formatDuration, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types/recording";

interface RecordingCardProps {
  recording: Recording;
  onPreview?: (recording: Recording) => void;
  index?: number;
}

export function RecordingCard({ recording, onPreview, index = 0 }: RecordingCardProps) {
  const { deleteRecording } = useRecordingsStore();

  const handleDownload = () => {
    if (!recording.url) return;
    const a = document.createElement("a");
    a.href = recording.url;
    a.download = `${recording.name}.webm`;
    a.click();
  };

  const handleDelete = () => {
    deleteRecording(recording.id);
  };

  const statusBadge = {
    local: { label: "Local", variant: "secondary" as const },
    uploaded: { label: "Uploaded", variant: "default" as const },
    shared: { label: "Shared", variant: "default" as const },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl hover:border-border/80 transition-all hover:-translate-y-0.5">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
          {recording.url ? (
            <video
              src={recording.url}
              className="h-full w-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {onPreview && (
                <Button
                  size="icon"
                  onClick={() => onPreview(recording)}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Play className="h-4 w-4 fill-white" />
                </Button>
              )}
              <Button
                size="icon"
                variant="secondary"
                asChild
                className="h-10 w-10 rounded-full"
              >
                <Link href={`/editor/${recording.id}`}>
                  <Scissors className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm gap-1">
              <Clock className="h-2.5 w-2.5" />
              {formatDuration(recording.duration)}
            </Badge>
          </div>

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={statusBadge[recording.status].variant}
              className={cn(
                "backdrop-blur-sm",
                recording.status === "shared" && "bg-emerald-500/90 text-white",
                recording.status === "uploaded" && "bg-indigo-500/90 text-white",
                recording.status === "local" && "bg-black/70 text-white"
              )}
            >
              {statusBadge[recording.status].label}
            </Badge>
          </div>

          {/* Menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/70 text-white backdrop-blur-sm">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {onPreview && (
                  <DropdownMenuItem onClick={() => onPreview(recording)}>
                    <Play className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/editor/${recording.id}`}>
                    <Scissors className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div>
            <p className="text-sm font-semibold truncate">{recording.name}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(recording.createdAt)}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatBytes(recording.size)}
            </span>
            <span>•</span>
            <span>{recording.resolution || recording.quality}</span>
            {recording.hasAudio && (
              <>
                <span>•</span>
                <span>Audio</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <UploadButton recording={recording} variant="outline" size="sm" className="flex-1" showInlineShare={false} />
            {(recording.status === "uploaded" || recording.status === "shared") && recording.shareUrl && (
              <ShareDialog recording={recording} />
            )}
          </div>

          {/* Share link row — visible immediately for published recordings */}
          {(recording.status === "uploaded" || recording.status === "shared") && recording.shareUrl && (
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(recording.shareUrl ?? "");
                  } catch {
                    // ignore
                  }
                }}
                className="gap-1.5 text-xs h-7 px-2"
              >
                <Link2 className="h-3 w-3 text-emerald-500" />
                Copy link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-1.5 text-xs h-7 px-2"
              >
                <a href={recording.shareUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
