/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { city_name, name } = await req.json();
    if (!city_name || !name) return NextResponse.json({ error: "City and name are required" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await (supabase.from("districts") as any).insert({ city_name, name });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, oldName, newName, city_name } = await req.json();
    if (!id || !oldName || !newName || !city_name) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Update in districts table
    const { error: districtError } = await (supabase.from("districts") as any)
      .update({ name: newName })
      .eq("id", id);
    
    if (districtError) throw districtError;

    // 2. Update all properties that used the old district name in that city
    const { error: propError } = await (supabase.from("properties") as any)
      .update({ district: newName })
      .eq("city", city_name)
      .eq("district", oldName);

    if (propError) throw propError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const city_name = searchParams.get("city_name");

    if (!id || !name || !city_name) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Delete district
    const { error: districtError } = await (supabase.from("districts") as any)
      .delete()
      .eq("id", id);
    
    if (districtError) throw districtError;

    // 2. Clear district in properties for that city
    const { error: propError } = await (supabase.from("properties") as any)
      .update({ district: null })
      .eq("city", city_name)
      .eq("district", name);

    if (propError) throw propError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
