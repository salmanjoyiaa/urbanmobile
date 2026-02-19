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
        let { data: agent } = (await supabase
          .from("agents")
          .select("*")
          .eq("profile_id", session.user.id)
          .single()) as { data: Agent | null };

        // Auto-create agent row if it doesn't exist yet (after email confirmation)
        if (!agent && session.user.user_metadata?.company_name) {
          try {
            const companyName = session.user.user_metadata.company_name;
            const licenseNumber = session.user.user_metadata.license_number || null;

            const res = await fetch("/api/agents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company_name: companyName,
                license_number: licenseNumber,
              }),
            });
            const json = await res.json();
            if (res.ok && json.agent) {
              agent = json.agent;
            }
          } catch (err) {
            console.error("Auto-create agent failed:", err);
          }
        }

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
