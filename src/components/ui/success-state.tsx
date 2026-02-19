import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export function SuccessState({
    title,
    description,
    actionLabel,
    actionHref,
    className,
}: SuccessStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in zoom-in duration-500", className)}>
            <div className="rounded-full bg-green-100 p-3 ring-8 ring-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {actionLabel && actionHref && (
                <Button asChild className="mt-4" variant="outline">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}
