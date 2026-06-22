"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { usePendingActionStore, type PendingAction } from "@/stores/pending-action-store";

/**
 * Returns a function that either runs the given action immediately (if the
 * user is authenticated) or stashes it as a pending action and kicks off the
 * Google sign-in flow. After the OAuth round-trip the caller is responsible
 * for resuming the action (see record/page.tsx).
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   requireAuth("publish", recording.id, () => publish(recording));
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const { setPending } = usePendingActionStore();
  const pathname = usePathname();

  return useCallback(
    <T>(
      actionType: PendingAction["type"],
      recordingId: string,
      action: () => Promise<T> | T
    ): Promise<T> | T | undefined => {
      if (isAuthenticated) {
        return action();
      }

      // Guest: remember what they wanted to do, then go sign in. The
      // callbackUrl sends them back to the same page after login so the
      // pending action can be resumed in place.
      setPending({
        type: actionType,
        recordingId,
        returnPath: pathname,
      });

      signIn("google", { callbackUrl: pathname });
      return undefined;
    },
    [isAuthenticated, pathname, setPending]
  );
}
