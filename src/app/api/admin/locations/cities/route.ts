/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await (supabase.from("cities") as any).insert({ name });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { oldName, newName } = await req.json();
    if (!oldName || !newName) return NextResponse.json({ error: "Missing names" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Update in cities table
    const { error: cityError } = await (supabase.from("cities") as any)
      .update({ name: newName })
      .eq("name", oldName);
    
    if (cityError) throw cityError;

    // 2. Update all properties that used the old city name
    const { error: propError } = await (supabase.from("properties") as any)
      .update({ city: newName })
      .eq("city", oldName);

    if (propError) throw propError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Delete city (will cascade delete districts via FK)
    const { error: cityError } = await (supabase.from("cities") as any)
      .delete()
      .eq("name", name);
    
    if (cityError) throw cityError;

    // 2. Clear city/district in properties
    const { error: propError } = await (supabase.from("properties") as any)
      .update({ city: null, district: null })
      .eq("city", name);

    if (propError) throw propError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
