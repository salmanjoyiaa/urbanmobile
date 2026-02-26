"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Loader2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { deleteProperty, approveProperty, rejectProperty, updatePropertyStatus } from "@/app/actions/admin";

interface PropertyActionsProps {
    id: string;
    title: string;
    status: string;
}

export function PropertyActions({ id, title, status }: PropertyActionsProps) {
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

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveProperty(id);
            if (result.success) {
                toast.success("Property approved and now visible to customers");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to approve");
            }
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            const result = await rejectProperty(id);
            if (result.success) {
                toast.success("Property rejected and removed");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to reject");
            }
        });
    };

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            const result = await updatePropertyStatus(id, newStatus);
            if (result.success) {
                toast.success(`Status changed to ${newStatus}`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update status");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {status === "pending" && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={handleApprove}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        <span className="sr-only">Approve</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={handleReject}
                        disabled={isPending}
                    >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Reject</span>
                    </Button>
                </>
            )}

            {status !== "pending" && (
                <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            )}

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
