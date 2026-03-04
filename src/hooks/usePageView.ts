"use client";

import { useEffect, useRef } from "react";

export function usePageView(page: string = "/") {
    const lastSentPage = useRef<string | null>(null);

    useEffect(() => {
        if (!page) return;
        if (lastSentPage.current === page) return;
        lastSentPage.current = page;

        fetch("/api/analytics/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                page,
                referrer: typeof document !== "undefined" ? document.referrer : null,
            }),
        }).catch(() => {
            // Silent fail — analytics should never break the page
        });
    }, [page]);
}
