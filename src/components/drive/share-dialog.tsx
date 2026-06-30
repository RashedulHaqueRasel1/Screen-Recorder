"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
            <Link2 className="h-3.5 w-3.5" />
            Share Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden border-border/60 p-0">
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 pb-5 pt-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/25">
            <Share2 className="h-5 w-5" />
          </div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Share Recording
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can view your recording on Google Drive.
          </DialogDescription>
        </DialogHeader>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
              <Link2 className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Public share link
              </p>
            </div>
            <p className="max-h-24 overflow-auto break-all rounded-xl bg-background/70 p-3 text-xs font-mono text-foreground">
              {shareUrl}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCopy} variant="outline" className="h-11 gap-2 rounded-xl">
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
            <Button asChild className="h-11 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open Link
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
