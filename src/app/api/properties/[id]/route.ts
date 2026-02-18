import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function GET(_request: Request, context: { params: { id: string } }) {
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
