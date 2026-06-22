"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Drive token store.
 *
 * Holds the Google OAuth access token (and refresh token + expiry) for the
 * client-side upload flow. The token is scoped to `drive.file` only — i.e.
 * RecStudio can manage the files it creates, never the user's full Drive.
 *
 * Persisted to localStorage so uploads survive navigation/refresh within a
 * session. This is a deliberate trade-off of the chosen client-upload
 * architecture: the access token is readable by client JS. The refresh token
 * is also kept here for completeness but refresh actually happens server-side
 * in the NextAuth `jwt` callback (see auth-config.ts), so the client only ever
 * receives a fresh short-lived access token via the session.
 */

interface DriveState {
  isConnected: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  setCredentials: (token: string, expiresAt: number, refreshToken?: string) => void;
  disconnect: () => void;
  updateToken: (token: string, expiresAt: number) => void;
}

export const useDriveStore = create<DriveState>()(
  persist(
    (set) => ({
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,

      setCredentials: (token, expiresAt, refreshToken) =>
        set({
          isConnected: true,
          accessToken: token,
          refreshToken: refreshToken ?? null,
          expiresAt,
        }),

      disconnect: () =>
        set({
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        }),

      updateToken: (token, expiresAt) =>
        set({
          accessToken: token,
          expiresAt,
        }),
    }),
    {
      name: "recstudio-drive",
    }
  )
);
