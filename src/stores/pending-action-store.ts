"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * A pending action the user tried to perform as a guest (e.g. publishing a
 * recording). We persist it to sessionStorage so it survives the OAuth
 * redirect round-trip, then resume it automatically once the user returns
 * authenticated. sessionStorage (not localStorage) so it doesn't outlive the
 * tab — a stale pending action from a previous session is worse than none.
 */
export type PendingAction =
  | { type: "publish"; recordingId: string; returnPath: string }
  | { type: "share"; recordingId: string; returnPath: string };

interface PendingActionState {
  pendingAction: PendingAction | null;
  setPending: (action: PendingAction) => void;
  clear: () => void;
}

export const usePendingActionStore = create<PendingActionState>()(
  persist(
    (set) => ({
      pendingAction: null,
      setPending: (action) => set({ pendingAction: action }),
      clear: () => set({ pendingAction: null }),
    }),
    {
      name: "recstudio-pending-action",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as unknown as Storage)
      ),
    }
  )
);
