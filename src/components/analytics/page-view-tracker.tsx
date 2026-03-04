"use client";

import { usePageView } from "@/hooks/usePageView";
import { usePathname, useSearchParams } from "next/navigation";

export function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isPublicTrackableRoute =
        pathname === "/" ||
        pathname.startsWith("/properties") ||
        pathname.startsWith("/products");

    const queryString = searchParams.toString();
    const page = isPublicTrackableRoute
        ? `${pathname}${queryString ? `?${queryString}` : ""}`
        : "";

    usePageView(page);
    return null;
}
