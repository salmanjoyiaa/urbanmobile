"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useAgents(status?: string) {
  return useQuery({
    queryKey: ["admin-agents", status],
    queryFn: async () => {
      let query = supabase
        .from("agents")
        .select("id, status, company_name, license_number, profiles:profile_id(full_name, email)")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = (await query) as {
        data: Array<Record<string, unknown>> | null;
        error: { message: string } | null;
      };

      if (error) throw new Error(error.message);
      return data || [];
    },
  });
}

function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; status: "approved" | "rejected" | "suspended"; rejection_reason?: string }) => {
      const response = await fetch(`/api/admin/agents/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: payload.status, rejection_reason: payload.rejection_reason }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update agent status");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
    },
  });
}

export function useApproveAgent() {
  const mutation = useUpdateAgentStatus();
  return {
    ...mutation,
    mutateAsync: (id: string) => mutation.mutateAsync({ id, status: "approved" }),
  };
}

export function useRejectAgent() {
  const mutation = useUpdateAgentStatus();
  return {
    ...mutation,
    mutateAsync: (id: string, rejectionReason?: string) =>
      mutation.mutateAsync({ id, status: "rejected", rejection_reason: rejectionReason }),
  };
}

export function useSuspendAgent() {
  const mutation = useUpdateAgentStatus();
  return {
    ...mutation,
    mutateAsync: (id: string) => mutation.mutateAsync({ id, status: "suspended" }),
  };
}
