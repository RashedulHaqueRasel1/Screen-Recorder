"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/drive/share-dialog";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types/recording";

interface ShareActionsProps {
  recording: Recording;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** Show the truncated URL text inline (default: true) */
  showUrl?: boolean;
}

/**
 * Inline share actions shown beside a Published button.
 *
 * Renders a prominent share-link pill with Copy, Open, and Share buttons.
 * Used in the UploadButton, PostRecordingPanel, RecordingCard, and History row
 * so the public link is immediately accessible after publishing — no
 * navigation required.
 */
export function ShareActions({
  recording,
  size = "sm",
  className,
  showUrl = true,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = recording.shareUrl ?? recording.driveUrl ?? "";

  if (!shareUrl) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Trim the URL for display: strip protocol + leading bits for a clean look
  const displayUrl = shareUrl
    .replace(/^https?:\/\//, "")
    .replace("drive.google.com/file/d/", "drive.google.com/…/")
    .replace("view", "")
    .replace(/[/?]+$/, "");

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {/* URL pill */}
      {showUrl && (
        <span className="hidden md:inline-flex items-center gap-1.5 max-w-[220px] rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
          <Link2 className="h-3 w-3 shrink-0 text-emerald-500" />
          <span className="truncate">{displayUrl}</span>
        </span>
      )}

      {/* Copy Link */}
      <Button
        variant="outline"
        size={size}
        onClick={handleCopy}
        className="gap-1.5 text-xs rounded-lg"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-500" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-3 w-3" />
            Copy
          </>
        )}
      </Button>

      {/* Open Link */}
      <Button
        variant="outline"
        size={size}
        asChild
        className="gap-1.5 text-xs rounded-lg"
      >
        <a href={shareUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </Button>

      {/* Share */}
      <ShareDialog
        recording={recording}
        trigger={
          <Button variant="outline" size={size} className="gap-1.5 text-xs rounded-lg">
            <Share2 className="h-3 w-3" />
            Share
          </Button>
        }
      />
    </div>
  );
}
