"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recording } from "@/types/recording";

interface RecordingsState {
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  getRecording: (id: string) => Recording | undefined;
  clearRecordings: () => void;
}

export const useRecordingsStore = create<RecordingsState>()(
  persist(
    (set, get) => ({
      recordings: [],

      addRecording: (recording) =>
        set((state) => ({
          recordings: [recording, ...state.recordings],
        })),

      updateRecording: (id, updates) =>
        set((state) => ({
          recordings: state.recordings.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteRecording: (id) =>
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
        })),

      getRecording: (id) => get().recordings.find((r) => r.id === id),

      clearRecordings: () => set({ recordings: [] }),
    }),
    {
      name: "recstudio-recordings",
      partialize: (state) => ({
        recordings: state.recordings.map((r) => ({
          ...r,
          url: r.url.startsWith("blob:") ? "" : r.url,
        })),
      }),
    }
  )
);
