import { ProductForm } from "@/components/product/product-form";

export default function AgentNewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Create Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
