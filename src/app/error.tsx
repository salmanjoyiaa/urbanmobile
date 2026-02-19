"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
            <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
                {error.message || "An unexpected error occurred."}
            </p>
            <Button onClick={reset} className="mt-6 rounded-lg bg-primary font-semibold text-white">
                Try again
            </Button>
        </div>
    );
}
