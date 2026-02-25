import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const supabase = createApiClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", context.params.id)
    .eq("status", "active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}
