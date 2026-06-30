"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  Loader2,
  AlertCircle,
  Link2,
  Rocket,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ShareActions } from "@/components/drive/share-actions";
import { ShareDialog } from "@/components/drive/share-dialog";
import { useDriveUpload } from "@/features/drive/hooks/use-drive-upload";
import { useDriveStore } from "@/stores/drive-store";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";
import type { Recording } from "@/types/recording";

interface UploadButtonProps {
  recording: Recording;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** Show inline share actions next to the Published button (default: true). */
  showInlineShare?: boolean;
  shareActionsShowUrl?: boolean;
  shareActionsShowShare?: boolean;
  label?: string;
}

export function UploadButton({
  recording,
  variant = "default",
  size = "sm",
  className,
  showInlineShare = true,
  shareActionsShowUrl = true,
  shareActionsShowShare = true,
  label,
}: UploadButtonProps) {
  const { uploadingId, progress, error, uploadRecording } = useDriveUpload();
  const { isConnected } = useDriveStore();
  const { getRecording } = useRecordingsStore();
  const { status: authStatus } = useCurrentUser();
  const requireAuth = useRequireAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const current = getRecording(recording.id) ?? recording;
  const isThisUploading = uploadingId === recording.id;
  const isUploaded =
    (current.status === "uploaded" || current.status === "shared") &&
    !!current.shareUrl;
  const isAuthenticated = authStatus === "authenticated";
  const shareUrl = current.shareUrl ?? current.driveUrl ?? "";

  const handleClick = () => {
    requireAuth("publish", recording.id, async () => {
      if (!isConnected) {
        setShowDialog(true);
        return;
      }
      await uploadRecording(current);
    });
  };

  // Detect when publish completes (uploadingId transitions away from our ID
  // while we were uploading) and show the success banner.
  const wasUploadingRef = useState(false);
  useEffect(() => {
    if (isThisUploading) {
      wasUploadingRef[0] = true;
    } else if (wasUploadingRef[0] && isUploaded) {
      // Upload just finished successfully
      setJustPublished(true);
      setShowSuccessBanner(true);
      setShowDialog(true); // open success dialog
      wasUploadingRef[0] = false;
      // Auto-dismiss banner after 6s
      const timer = setTimeout(() => setShowSuccessBanner(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isThisUploading, isUploaded]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const isPrimary = variant === "default";

  return (
    <>
      {/* --- Main publish button --- */}
      <Button
        onClick={handleClick}
        disabled={isThisUploading}
        variant={variant}
        size={size}
        className={cn(
          "font-medium gap-2",
          isPrimary &&
            "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white",
          className
        )}
      >
        {isThisUploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {progress}%
          </>
        ) : isUploaded ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Published
          </>
        ) : (
          <>
            {isPrimary ? (
              <Rocket className="h-3.5 w-3.5" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5" />
            )}
            {label ?? (isPrimary ? "Publish" : "Upload to Drive")}
          </>
        )}
      </Button>

      {/* --- Inline share actions (visible immediately once published) --- */}
      {showInlineShare && isUploaded && (
        <ShareActions
          recording={current}
          size={size}
          showUrl={shareActionsShowUrl}
          showShare={shareActionsShowShare}
        />
      )}

      {/* --- Success notification banner --- */}
      {showSuccessBanner && isUploaded && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl p-4 shadow-xl animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-500">
                Published successfully!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your share link is ready.
              </p>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Link2 className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs gap-1"
                >
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </a>
                </Button>
                <ShareDialog
                  recording={current}
                  trigger={
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <Share2 className="h-3 w-3" />
                      Share
                    </Button>
                  }
                />
              </div>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- Progress dialog --- */}
      <Dialog open={isThisUploading} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-purple-500" />
              Publishing to Drive
            </DialogTitle>
            <DialogDescription>
              {recording.name} is being uploaded to your Google Drive and made
              shareable.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Success / share dialog (auto-opens on first publish) --- */}
      <Dialog open={justPublished && showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Published
            </DialogTitle>
            <DialogDescription>
              Your recording is now on Google Drive and shareable with anyone who
              has the link.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-sm font-semibold text-emerald-500">
                Shareable link ready
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Copy it, open it, or share it from the buttons below.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button asChild variant="outline" className="gap-1.5">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </Button>
              <ShareDialog
                recording={current}
                trigger={
                  <Button variant="outline" className="gap-1.5">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Not connected (Drive token missing) --- */}
      <Dialog
        open={!isConnected && isAuthenticated && showDialog}
        onOpenChange={setShowDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Reconnect Google Drive
            </DialogTitle>
            <DialogDescription>
              Your Google Drive isn&apos;t connected. Reconnect to grant
              RecStudio permission to publish recordings to your Drive.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              We only request access to files created by RecStudio — never your
              full Drive.
            </p>
            <Button
              onClick={() => (window.location.href = "/signin")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              Reconnect Google Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Error toast inline --- */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl p-4 text-sm text-red-500">
          {error}
        </div>
      )}
    </>
  );
}
