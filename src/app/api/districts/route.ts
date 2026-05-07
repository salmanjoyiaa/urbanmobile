import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city) {
        return NextResponse.json({ error: "City parameter is required" }, { status: 400 });
    }

    const supabase = await createRouteClient();

    // Query districts from the dedicated table
    const { data, error } = (await supabase
        .from("districts")
        .select("name")
        .eq("city_name", city)
        .order("name", { ascending: true })) as { data: { name: string }[] | null; error: { message: string } | null };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract districts
    const distinctDistricts = data?.map(item => item.name) || [];
    


    return NextResponse.json({ districts: distinctDistricts });
}
