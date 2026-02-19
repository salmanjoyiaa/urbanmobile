"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
                {error.message || "We couldn't load this page. Please try again."}
            </p>
            <div className="mt-6 flex gap-3">
                <Button onClick={reset} className="rounded-lg bg-primary font-semibold text-white">
                    Try again
                </Button>
                <Link href="/">
                    <Button variant="outline" className="rounded-lg">Go Home</Button>
                </Link>
            </div>
        </div>
    );
}
