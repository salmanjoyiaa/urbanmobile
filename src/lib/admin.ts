import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminRouteContext() {
  const supabase = await createRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      error: "Unauthorized",
      status: 401,
    };
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()) as { data: { id: string; role: string } | null };

  if (!profile || profile.role !== "admin") {
    return {
      supabase,
      user,
      profile,
      error: "Forbidden",
      status: 403,
    };
  }

  return {
    supabase,
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
  const supabase = await createRouteClient();

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
