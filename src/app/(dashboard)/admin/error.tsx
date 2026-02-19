"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[UrbanSaudi:admin] Error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mt-6 text-xl font-bold">Dashboard Error</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                An error occurred while loading this page. Try refreshing.
            </p>
            {error.message && (
                <p className="mt-2 max-w-lg rounded bg-muted p-2 font-mono text-xs text-destructive">
                    {error.message}
                </p>
            )}
            <Button onClick={reset} className="mt-6" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
            </Button>
        </div>
    );
}
