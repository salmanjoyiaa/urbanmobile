import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";

export async function GET() {
    const supabase = await createRouteClient();

    // Query cities from the dedicated table
    const { data, error } = (await supabase
        .from("cities")
        .select("name")
        .order("name", { ascending: true })) as { data: { name: string }[] | null; error: { message: string } | null };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract cities
    const cities = data?.map(item => item.name) || [];

    return NextResponse.json({ cities });
}
