"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProperty } from "@/app/actions/admin";

interface PropertyActionsProps {
    id: string;
    title: string;
}

export function PropertyActions({ id, title }: PropertyActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteProperty(id);

            if (result.success) {
                toast.success("Property deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete property");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Link href={`/admin/properties/${id}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
            </Link>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-medium text-foreground">&quot;{title}&quot;</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
