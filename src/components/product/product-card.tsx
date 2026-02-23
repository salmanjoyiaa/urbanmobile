import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[] | null;
};

export function ProductCard({ product }: { product: Product }) {
  const imgSrc = product.images?.[0] || null;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-[#eff3f4] bg-white transition-colors hover:bg-[#f7f9f9]">
        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-[#f7f9f9]">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-[#cfd9de]" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[12px] font-bold capitalize text-[#0f1419] backdrop-blur-sm">
            {product.condition.replace("_", " ")}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="truncate text-[13px] sm:text-[15px] font-bold text-[#0f1419]">
            {product.title}
          </h3>
          <p className="mt-0.5 text-[13px] sm:text-[15px] font-bold text-[#1d9bf0]">
            SAR {product.price.toLocaleString()}
          </p>
          <span className="mt-2 inline-block rounded-full bg-[#eff3f4] px-2.5 py-0.5 text-[12px] font-medium capitalize text-[#536471]">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
