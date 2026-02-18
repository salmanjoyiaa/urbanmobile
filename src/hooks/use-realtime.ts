"use client";

import { useEffect, useMemo } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type RealtimeHookParams = {
  channel: string;
  table: string;
  filter?: string;
  events?: Array<"INSERT" | "UPDATE" | "DELETE" | "*">;
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  enabled?: boolean;
};

export function useRealtime({
  channel,
  table,
  filter,
  events = ["*"],
  onChange,
  enabled = true,
}: RealtimeHookParams) {
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!enabled) return;

    let realtimeChannel: RealtimeChannel | null = supabase.channel(channel);

    events.forEach((event) => {
      realtimeChannel = realtimeChannel!.on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter,
        },
        (payload) => {
          onChange(payload as RealtimePostgresChangesPayload<Record<string, unknown>>);
        }
      );
    });

    realtimeChannel.subscribe();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [channel, enabled, events, filter, onChange, supabase, table]);
}
