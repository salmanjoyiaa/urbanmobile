import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

export default function ProductsLoadingPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
