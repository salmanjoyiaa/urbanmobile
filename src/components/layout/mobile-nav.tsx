"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-[#0f1419]">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-white">
                    <SheetHeader>
                        <SheetTitle className="text-left text-xl font-bold text-[#0f1419]">
                            Urban<span className="text-[#1d9bf0]">Saudi</span>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-6 flex flex-col gap-1">
                        <Link
                            href="/properties"
                            onClick={() => setOpen(false)}
                            className="rounded-full px-4 py-2.5 text-[15px] font-medium text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419]"
                        >
                            Properties
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setOpen(false)}
                            className="rounded-full px-4 py-2.5 text-[15px] font-medium text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419]"
                        >
                            Products
                        </Link>
                        <Link
                            href="/maintenance"
                            onClick={() => setOpen(false)}
                            className="rounded-full px-4 py-2.5 text-[15px] font-medium text-[#536471] transition-colors hover:bg-[#eff3f4] hover:text-[#0f1419]"
                        >
                            Maintenance
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-full px-4 py-2.5 text-[15px] font-bold text-[#0f1419] transition-colors hover:bg-[#eff3f4]"
                        >
                            Agent <span className="text-[#1d9bf0]">Login</span>
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
