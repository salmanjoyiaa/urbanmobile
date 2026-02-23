"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/admin";

async function checkAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role: string } | null };

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }

    return { userId: user.id };
}

export async function deleteProperty(id: string) {
    try {
        const { userId } = await checkAdmin();
        const adminDb = createAdminClient();

        const { error } = await adminDb.from("properties").delete().eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        await writeAuditLog({
            actorId: userId,
            action: "deleted",
            entityType: "properties",
            entityId: id,
        });

        revalidatePath("/admin/properties");
        revalidatePath("/properties");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete property" };
    }
}

export async function deleteProduct(id: string) {
    try {
        const { userId } = await checkAdmin();
        const adminDb = createAdminClient();

        const { error } = await adminDb.from("products").delete().eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        await writeAuditLog({
            actorId: userId,
            action: "deleted",
            entityType: "products",
            entityId: id,
        });

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete product" };
    }
}
