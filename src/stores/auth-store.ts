"use client";

import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  user: null,

  setUser: (user) =>
    set({
      isAuthenticated: !!user,
      user,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
