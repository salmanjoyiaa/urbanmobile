import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRouteClient } from "@/lib/supabase/route";
import { upsertAgentRowAndSetAgentRole } from "@/lib/server/agent-application";

const createSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    phone: z.string().optional(),
    agent_type: z.enum(["property", "seller", "maintenance"]).default("property"),
});

export async function POST(req: Request) {
    try {
        const supabase = await createRouteClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();

        // Verify requesting user is admin
        const { data } = await admin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = data as any;

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = createSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { email, password, full_name, phone, agent_type } = parsed.data;

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                phone,
                role: "agent",
            },
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || "Failed to create Auth User" }, { status: 400 });
        }

        const result = await upsertAgentRowAndSetAgentRole(admin, {
            profileId: authData.user.id,
            agent_type,
            company_name: "Urbans Saudi Independent",
            license_number: null,
            document_url: null,
            bio: null,
            status: "approved",
        });

        if (!result.ok) {
            console.error("[api/admin/agents] upsert failed:", result.error);
            await admin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: "Failed to create Admin Agent Profile" }, { status: 500 });
        }

        const label =
            agent_type === "seller" ? "Seller" : agent_type === "maintenance" ? "Maintenance agent" : "Property agent";
        return NextResponse.json({ success: true, message: `${label} created successfully.` }, { status: 201 });
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
