"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeOption = "light" | "dark" | "system";
type DefaultQuality = "720p" | "1080p" | "1440p";
type DefaultSource = "screen" | "window" | "tab" | "webcam";

interface NotificationPreferences {
  publishSuccess: boolean;
  uploadErrors: boolean;
  recordingReminders: boolean;
}

interface SettingsState {
  // Recording defaults
  defaultQuality: DefaultQuality;
  defaultSource: DefaultSource;

  // Notifications
  notifications: NotificationPreferences;

  // Actions
  setDefaultQuality: (quality: DefaultQuality) => void;
  setDefaultSource: (source: DefaultSource) => void;
  setNotifications: (prefs: Partial<NotificationPreferences>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultQuality: "1080p",
      defaultSource: "screen",

      notifications: {
        publishSuccess: true,
        uploadErrors: true,
        recordingReminders: false,
      },

      setDefaultQuality: (quality) => set({ defaultQuality: quality }),
      setDefaultSource: (source) => set({ defaultSource: source }),
      setNotifications: (prefs) =>
        set((state) => ({
          notifications: { ...state.notifications, ...prefs },
        })),
      resetSettings: () =>
        set({
          defaultQuality: "1080p",
          defaultSource: "screen",
          notifications: {
            publishSuccess: true,
            uploadErrors: true,
            recordingReminders: false,
          },
        }),
    }),
    {
      name: "recstudio-settings",
    }
  )
);
