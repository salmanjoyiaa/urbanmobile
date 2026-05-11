import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const res = await fetch(`${supabaseUrl}/rest/v1/maintenance_requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "return=minimal",
            },
            body: JSON.stringify({
                service_id: body.service_id || null,
                agent_id: body.agent_id || null,
                service_type: body.service_type,
                customer_name: body.customer_name,
                customer_email: body.customer_email,
                customer_phone: body.customer_phone,
                details: body.details || null,
                visit_date: body.visit_date || null,
                visit_time: body.visit_time || null,
                audio_url: body.audio_url || null,
                media_urls: body.media_urls || [],
                status: "pending",
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText }, { status: res.status });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal error" },
            { status: 500 }
        );
    }
}
