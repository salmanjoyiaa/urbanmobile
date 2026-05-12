import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

export async function getAdminRouteContext() {
  const supabase = await createRouteClient();

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Fallback: Bearer token auth for mobile app
  let mobileClient = supabase;
  if (!user) {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      mobileClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data } = await mobileClient.auth.getUser(token);
      user = data.user;
    }
  }

  if (!user) {
    return {
      supabase: mobileClient,
      user: null,
      profile: null,
      error: "Unauthorized",
      status: 401,
    };
  }

  const { data: profile } = (await mobileClient
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()) as { data: { id: string; role: string } | null };

  if (!profile || profile.role !== "admin") {
    return {
      supabase: mobileClient,
      user,
      profile,
      error: "Forbidden",
      status: 403,
    };
  }

  return {
    supabase: mobileClient,
    user,
    profile,
    error: null,
    status: 200,
  };
}

export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  await supabase.from("audit_log").insert({
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    metadata: params.metadata || {},
  } as never);
}

export async function notifyAdmins(params: {
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const { data: admins } = (await supabase.from("profiles").select("id").eq("role", "admin")) as { data: { id: string }[] | null };
  if (!admins || admins.length === 0) return;

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    title: params.title,
    body: params.body,
    type: params.type,
    metadata: params.metadata || {},
  }));

  await supabase.from("notifications").insert(notifications as never);
}

export async function notifyUsers(params: {
  userIds: string[];
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  const ids = Array.from(new Set(params.userIds.filter(Boolean)));
  if (ids.length === 0) return;

  const supabase = createAdminClient();
  const notifications = ids.map((userId) => ({
    user_id: userId,
    title: params.title,
    body: params.body,
    type: params.type,
    metadata: params.metadata || {},
  }));

  await supabase.from("notifications").insert(notifications as never);
}
