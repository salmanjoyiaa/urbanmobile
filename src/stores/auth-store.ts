"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile, Agent } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  agent: Agent | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  agent: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAgent: (agent) => set({ agent }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, profile: null, agent: null, isLoading: false }),
}));
