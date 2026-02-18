"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, profile, agent, isLoading } = useAuthStore();

  return {
    user,
    profile,
    agent,
    isLoading,
    isAuthenticated: !!user,
    role: profile?.role ?? null,
    isAdmin: profile?.role === "admin",
    isAgent: profile?.role === "agent",
    isCustomer: profile?.role === "customer",
    isApprovedAgent: profile?.role === "agent" && agent?.status === "approved",
  };
}
