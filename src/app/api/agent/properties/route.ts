import { NextResponse } from "next/server";
import { propertySchema } from "@/lib/validators";
import { createRouteClient } from "@/lib/supabase/route";
import type { Database } from "@/types/database";

async function getApprovedAgentId() {
  const supabase = await createRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, agentId: null as string | null, error: "Unauthorized", status: 401 };
  }

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, status")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; status: string } | null };

  if (!agent || agent.status !== "approved") {
    return { supabase, agentId: null as string | null, error: "Agent not approved", status: 403 };
  }

  return { supabase, agentId: agent.id, error: null, status: 200 };
}

export async function GET() {
  const { supabase, agentId, error, status } = await getApprovedAgentId();
  if (!agentId) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = (await supabase
    .from("properties")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })) as {
      data: Database["public"]["Tables"]["properties"]["Row"][] | null;
      error: { message: string } | null;
    };

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
  const { supabase, agentId, error, status } = await getApprovedAgentId();
  if (!agentId) return NextResponse.json({ error }, { status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const payload: Database["public"]["Tables"]["properties"]["Insert"] = {
    ...parsed.data,
    district: parsed.data.district || null,
    address: parsed.data.address || null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    bedrooms: parsed.data.bedrooms ?? null,
    bathrooms: parsed.data.bathrooms ?? null,
    kitchens: parsed.data.kitchens ?? null,
    living_rooms: parsed.data.living_rooms ?? null,
    drawing_rooms: parsed.data.drawing_rooms ?? null,
    area_sqm: parsed.data.area_sqm ?? null,
    year_built: parsed.data.year_built ?? null,
    amenities: parsed.data.amenities || [],
    images: parsed.data.images || [],
    property_ref: parsed.data.property_ref || null,
    layout: parsed.data.layout || null,
    building_features: parsed.data.building_features || [],
    apartment_features: parsed.data.apartment_features || [],
    location_url: parsed.data.location_url || null,
    rental_period: parsed.data.rental_period || null,
    office_fee: parsed.data.office_fee || null,
    water_bill_included: parsed.data.water_bill_included || null,
    security_deposit: parsed.data.security_deposit || null,
    nearby_places: parsed.data.nearby_places || [],
    drive_link: parsed.data.drive_link || null,
    broker_fee: parsed.data.broker_fee || null,
    payment_methods_accepted: parsed.data.payment_methods_accepted || null,
    cover_image_index: parsed.data.cover_image_index ?? 0,
    blocked_dates: parsed.data.blocked_dates || [],
    visiting_agent_instructions: parsed.data.visiting_agent_instructions || null,
    visiting_agent_image: parsed.data.visiting_agent_image || null,
    agent_id: agentId,
    status: "pending",
    featured: false,
  };

  const { data, error: insertError } = (await supabase
    .from("properties")
    .insert(payload as never)
    .select("id")
    .single()) as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
}
