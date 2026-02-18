import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSAR } from "@/lib/format";
import type { Product } from "@/types/database";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const cover = product.images?.[0];

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-[16/10] w-full bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>

        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold">{product.title}</h3>
            <Badge variant="outline" className="capitalize">
              {product.condition.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-lg font-bold text-navy">{formatSAR(product.price)}</p>
        </CardHeader>

        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="capitalize">{product.category}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {product.city}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
