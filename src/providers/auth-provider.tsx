"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Agent, Profile } from "@/types/database";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { setUser, setProfile, setAgent, setLoading, reset } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async (session: Session | null) => {
      if (!mounted) return;

      if (!session?.user) {
        reset();
        return;
      }

      setLoading(true);
      setUser(session.user);

      const { data: profile } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()) as { data: Profile | null };

      setProfile(profile);

      if (profile?.role === "agent") {
        const { data: agent } = (await supabase
          .from("agents")
          .select("*")
          .eq("profile_id", session.user.id)
          .single()) as { data: Agent | null };
        setAgent(agent);
      } else {
        setAgent(null);
      }

      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => hydrateSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateSession(session).then(() => {
        router.refresh();
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [reset, router, setAgent, setLoading, setProfile, setUser, supabase]);

  return <>{children}</>;
}
