import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
            <h1 className="text-7xl font-bold text-primary">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h2>
            <p className="mt-2 text-muted-foreground">The page you are looking for doesn&apos;t exist or has been moved.</p>
            <Link href="/" className="mt-8">
                <Button className="rounded-lg bg-primary font-semibold text-white">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
