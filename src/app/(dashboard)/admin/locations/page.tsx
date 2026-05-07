import { createAdminClient } from "@/lib/supabase/admin";
import { LocationsClient } from "./locations-client";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const supabase = createAdminClient();

  // Fetch cities
  const { data: citiesData } = await supabase
    .from("cities")
    .select("name, created_at")
    .order("name", { ascending: true });

  // Fetch districts
  const { data: districtsData } = await supabase
    .from("districts")
    .select("id, city_name, name")
    .order("name", { ascending: true });

  const cities = citiesData || [];
  const districts = districtsData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Locations Manager</h1>
        <p className="text-sm text-muted-foreground">
          Manage cities and districts globally. Renaming or deleting a location here will automatically update all properties associated with it.
        </p>
      </div>
      
      <LocationsClient initialCities={cities} initialDistricts={districts} />
    </div>
  );
}
