/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { city_name, oldDistrictIds, oldDistrictNames, newDistrictName } = await req.json();

    if (!city_name || !oldDistrictIds?.length || !oldDistrictNames?.length || !newDistrictName) {
      return NextResponse.json({ error: "Missing required merge data" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ensure the new district name exists in the districts table
    // Using an upsert operation. Since there's a UNIQUE(city_name, name) constraint, 
    // it will just do nothing if it already exists.
    const { error: upsertError } = await (supabase.from("districts") as any).upsert(
      { city_name, name: newDistrictName },
      { onConflict: 'city_name, name', ignoreDuplicates: true }
    );

    if (upsertError) throw upsertError;

    // 2. Update properties: Set district = newDistrictName where district is one of oldDistrictNames
    const { error: propError } = await (supabase.from("properties") as any)
      .update({ district: newDistrictName })
      .eq("city", city_name)
      .in("district", oldDistrictNames);

    if (propError) throw propError;

    // 3. Delete the old districts from the `districts` table, EXCEPT the one we are keeping
    // (if one of the selected districts happens to already match the new name, we don't delete it).
    const { error: deleteError } = await (supabase.from("districts") as any)
      .delete()
      .in("id", oldDistrictIds)
      .neq("name", newDistrictName); // Important: don't delete the new one if its ID was selected

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "An error occurred during merge" }, { status: 500 });
  }
}
