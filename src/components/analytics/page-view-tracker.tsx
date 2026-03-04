"use client";

import { usePageView } from "@/hooks/usePageView";

export function PageViewTracker({ page }: { page: string }) {
    usePageView(page);
    return null;
}
