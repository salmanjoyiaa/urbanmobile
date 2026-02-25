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
      <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-slate-950/90 px-2.5 py-0.5 text-[12px] font-bold capitalize text-slate-900 dark:text-white backdrop-blur-sm">
            {product.condition.replace("_", " ")}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="truncate text-[13px] sm:text-[15px] font-bold text-slate-900 dark:text-white">
            {product.title}
          </h3>
          <p className="mt-0.5 text-[13px] sm:text-[15px] font-bold text-blue-500 dark:text-blue-400">
            SAR {product.price.toLocaleString()}
          </p>
          <span className="mt-2 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[12px] font-medium capitalize text-slate-600 dark:text-slate-400">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
