import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  const propertyId = request.nextUrl.searchParams.get("property_id");
  if (!date || !propertyId) return NextResponse.json({ error: "date and property_id are required" }, { status: 400 });

  const { data, error } = await supabase
    .from("blocked_slots")
    .select("id, date, time")
    .eq("date", date)
    .eq("property_id", propertyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, time, property_id } = body;
  if (!date || !time || !property_id) return NextResponse.json({ error: "date, time, and property_id are required" }, { status: 400 });

  const { error } = await supabase
    .from("blocked_slots")
    .insert({ date, time, property_id, blocked_by: user.id } as never);

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Already blocked" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  const time = request.nextUrl.searchParams.get("time");
  const propertyId = request.nextUrl.searchParams.get("property_id");
  if (!date || !time || !propertyId) return NextResponse.json({ error: "date, time, and property_id are required" }, { status: 400 });

  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("date", date)
    .eq("time", time)
    .eq("property_id", propertyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
