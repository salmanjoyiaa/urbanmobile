import Link from "next/link";
import { BedDouble, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSAR } from "@/lib/format";
import type { Property } from "@/types/database";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const cover = property.images?.[0];

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-[16/10] w-full bg-muted">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
          )}
        </div>
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold">{property.title}</h3>
            <Badge variant="outline" className="capitalize">
              {property.type}
            </Badge>
          </div>
          <p className="text-lg font-bold text-navy">{formatSAR(property.price)}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms ?? 0} bd
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
