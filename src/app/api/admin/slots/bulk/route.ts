import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, time, property_ids } = body;
  
  if (!date || !time || !property_ids || !Array.isArray(property_ids) || property_ids.length === 0) {
    return NextResponse.json({ error: "date, time, and an array of property_ids are required" }, { status: 400 });
  }

  // 1. Fetch properties for titles in errors
  const { data: propertiesData } = await supabase
    .from("properties")
    .select("id, title")
    .in("id", property_ids);
    
  const properties = (propertiesData || []) as { id: string; title: string }[];
  const titleById = new Map(properties.map((p) => [p.id, p.title]));

  // 2. Fetch existing blocked slots for these properties at this date and time
  const { data: existingBlocked } = await supabase
    .from("blocked_slots")
    .select("property_id")
    .eq("date", date)
    .eq("time", time)
    .in("property_id", property_ids);

  const blockedPropertyIds = new Set(((existingBlocked || []) as { property_id: string }[]).map((b) => b.property_id));

  // 3. Fetch active visit requests for these properties at this date and time
  const { data: existingVisits } = await supabase
    .from("visit_requests")
    .select("property_id")
    .eq("visit_date", date)
    .eq("visit_time", time + ":00") // Time from UI is usually HH:MM, DB has HH:MM:SS
    .in("status", ["pending", "assigned", "confirmed"])
    .in("property_id", property_ids);
    
  const { data: existingVisitsNoSeconds } = await supabase
    .from("visit_requests")
    .select("property_id")
    .eq("visit_date", date)
    .eq("visit_time", time) // Just in case it's stored as HH:MM
    .in("status", ["pending", "assigned", "confirmed"])
    .in("property_id", property_ids);

  const bookedPropertyIds = new Set([
    ...((existingVisits || []) as { property_id: string }[]).map((v) => v.property_id),
    ...((existingVisitsNoSeconds || []) as { property_id: string }[]).map((v) => v.property_id)
  ]);

  const successIds: string[] = [];
  const failed: Array<{ property_id: string; title: string; reason: string }> = [];

  for (const pid of property_ids) {
    if (bookedPropertyIds.has(pid)) {
      failed.push({
        property_id: pid,
        title: titleById.get(pid) || pid,
        reason: "Already booked by a customer",
      });
    } else if (blockedPropertyIds.has(pid)) {
      // It's already blocked, which means it's technically a success from the user's intent to "make it blocked"
      // But we can just skip it without inserting.
      successIds.push(pid);
    } else {
      successIds.push(pid);
    }
  }

  // Filter out the ones that are already in `blockedPropertyIds` from the insertion list
  const toInsert = successIds.filter((id) => !blockedPropertyIds.has(id));

  if (toInsert.length > 0) {
    const insertData = toInsert.map((pid) => ({
      date,
      time,
      property_id: pid,
      blocked_by: user.id,
    }));

    const { error: insertError } = await supabase
      .from("blocked_slots")
      .insert(insertData as never);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    blocked: successIds.length,
    failed,
  }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  const time = request.nextUrl.searchParams.get("time");
  const propertyIdsParam = request.nextUrl.searchParams.get("property_ids");
  
  if (!date || !time || !propertyIdsParam) {
    return NextResponse.json({ error: "date, time, and property_ids are required" }, { status: 400 });
  }

  const property_ids = propertyIdsParam.split(",");

  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("date", date)
    .eq("time", time)
    .in("property_id", property_ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true });
}
