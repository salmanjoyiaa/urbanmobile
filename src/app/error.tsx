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
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="h-8 w-8 text-red-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Something went wrong!</h1>
                <p className="max-w-md text-gray-500">
                    {error.message || "An unexpected error occurred. We've been notified and are working to fix it."}
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={() => window.location.href = "/"} variant="outline">
                        Go Home
                    </Button>
                    <Button onClick={reset}>
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
