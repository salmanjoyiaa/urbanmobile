import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="aspect-square relative">
                <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </CardFooter>
        </Card>
    );
}
