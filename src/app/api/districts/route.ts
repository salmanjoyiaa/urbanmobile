import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city) {
        return NextResponse.json({ error: "City parameter is required" }, { status: 400 });
    }

    const supabase = await createRouteClient();

    // Query distinct districts for the given city
    const { data, error } = (await supabase
        .from("properties")
        .select("district")
        .eq("city", city)
        .not("district", "is", null)
        .neq("district", "")) as { data: { district: string }[] | null; error: { message: string } | null };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract distinct non-null districts
    const distinctDistricts = Array.from(new Set(data?.map(item => item.district).filter(Boolean) || []));
    
    // Sort alphabetically
    distinctDistricts.sort();

    return NextResponse.json({ districts: distinctDistricts });
}
