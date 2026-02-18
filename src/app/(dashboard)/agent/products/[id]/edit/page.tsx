import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product/product-form";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

type PageProps = {
  params: { id: string };
};

export default async function AgentEditProductPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single()) as { data: Product | null };

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Edit Product</h1>
      <ProductForm mode="edit" initialData={data} />
    </div>
  );
}
