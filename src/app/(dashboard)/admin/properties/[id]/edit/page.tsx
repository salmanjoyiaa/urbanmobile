import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/property/property-form";
import type { Property } from "@/types/database";

export default async function AdminEditPropertyPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: property, error } = (await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .single()) as { data: Property | null; error: unknown };

    if (error || !property) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">Edit Property</h1>
                <p className="text-sm text-muted-foreground">Update property details as administrator.</p>
            </div>

            <PropertyForm
                mode="edit"
                initialData={property}
                submitEndpoint={`/api/admin/properties/${property.id}`}
                redirectPath="/admin/properties"
            />
        </div>
    );
}
