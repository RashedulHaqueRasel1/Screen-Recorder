"use client";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { useDriveStore } from "@/stores/drive-store";

export function useCurrentUser() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { setCredentials, disconnect } = useDriveStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.email ?? "",
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image,
      });

      // Mirror the Drive-scoped access token (openid/email/profile + drive.file
      // only) into the drive store so the upload flow can use it. We seed it
      // whenever the server hands us a token — including after the jwt callback
      // has transparently refreshed an expired access token. The `expiresAt`
      // check guards against seeding a token we know is already dead; a
      // refreshError from the server is surfaced so the UI can prompt reconnect.
      if (session.accessToken && session.expiresAt) {
        const now = Date.now();
        if (session.expiresAt > now) {
          setCredentials(
            session.accessToken,
            session.expiresAt,
            session.refreshToken
          );
        }
      }
    } else if (status === "unauthenticated") {
      logout();
      disconnect();
    }
  }, [session, status, setUser, logout, setCredentials, disconnect]);

  return {
    user,
    isAuthenticated,
    status,
    session,
  };
}
