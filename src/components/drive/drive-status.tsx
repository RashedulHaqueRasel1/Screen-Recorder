"use client";

import { HardDrive, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDriveStore } from "@/stores/drive-store";
import { cn } from "@/lib/utils";

interface DriveStatusProps {
  variant?: "card" | "compact";
  className?: string;
}

export function DriveStatus({ variant = "card", className }: DriveStatusProps) {
  const { isConnected } = useDriveStore();

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium", className)}>
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          )}
          <span className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-muted-foreground"
          )} />
        </span>
        <span className={isConnected ? "text-emerald-500" : "text-muted-foreground"}>
          {isConnected ? "Drive Connected" : "Drive Not Connected"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            isConnected
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : "bg-gradient-to-br from-muted to-muted-foreground/20"
          )}>
            {isConnected ? (
              <ShieldCheck className="h-5.5 w-5.5 text-white" />
            ) : (
              <XCircle className="h-5.5 w-5.5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold">Google Drive</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Connected & ready to upload" : "Not connected"}
            </p>
          </div>
        </div>
        <HardDrive className={cn("h-5 w-5", isConnected ? "text-emerald-500" : "text-muted-foreground")} />
      </div>

      {!isConnected && (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground mb-3">
            Connect Google Drive to upload recordings and generate shareable links.
          </p>
          <Button
            asChild
            size="sm"
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          >
            <a href="/signin">
              <RefreshCw className="h-3.5 w-3.5" />
              Reconnect Account
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
