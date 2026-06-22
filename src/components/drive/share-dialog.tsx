"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Recording } from "@/types/recording";

interface ShareDialogProps {
  recording: Recording;
  trigger?: React.ReactNode;
}

export function ShareDialog({ recording, trigger }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = recording.shareUrl ?? recording.driveUrl ?? "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!shareUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-500" />
            Share Recording
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can view your recording on Google Drive.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <p className="text-xs text-muted-foreground mb-1">Public share link</p>
            <p className="text-xs font-mono break-all text-foreground">{shareUrl}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button asChild className="gap-2">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open Link
              </a>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
