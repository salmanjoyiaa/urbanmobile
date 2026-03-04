"use client";

import { useEffect, useRef } from "react";

export function usePageView(page: string = "/") {
    const sent = useRef(false);

    useEffect(() => {
        if (sent.current) return;
        sent.current = true;

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
