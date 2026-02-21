import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRouteClient } from "@/lib/supabase/route";

const createSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    phone: z.string().optional(),
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

        const profile = data as any;

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = createSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { email, password, full_name, phone } = parsed.data;

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

        // 2. The database trigger automatically creates the `profiles` row with role = 'agent'.
        // 3. Immediately upsert the `agents` row, force `agent_type` = 'visiting' and 'approved'
        const payload = {
            profile_id: authData.user.id,
            agent_type: "visiting",
            status: "approved",
            company_name: "Internal Visiting Team",
        };

        const { error: agentError } = await admin.from("agents").upsert(payload as any, { onConflict: "profile_id" });

        if (agentError) {
            // Cleanup auth user on failure
            await admin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: "Failed to create Admin Agent Profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Visiting Agent created successfully." }, { status: 201 });
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
