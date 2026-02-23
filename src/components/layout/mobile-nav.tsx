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
                    <Button variant="ghost" size="icon" className="text-[#2A201A] hover:bg-[#2A201A]/5">
                        <Menu className="h-6 w-6 stroke-[2.5]" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#FCF9F2] p-6 border-r border-[#D9C5B2]/30">
                    <SheetHeader>
                        <SheetTitle className="text-left py-4 border-b border-[#D9C5B2]/30">
                            <span className="text-[22px] font-black tracking-tight text-[#2A201A] leading-none">
                                TheUrbanRealEstate<span className="text-[26px] font-black">Saudi</span>
                            </span>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col gap-2 px-2">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3.5 text-[16px] font-bold tracking-wide text-[#2A201A] transition-all hover:bg-[#2A201A]/5 active:scale-95"
                        >
                            Home
                        </Link>
                        <Link
                            href="/properties"
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3.5 text-[16px] font-bold tracking-wide text-[#2A201A] transition-all hover:bg-[#2A201A]/5 active:scale-95"
                        >
                            Properties
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3.5 text-[16px] font-bold tracking-wide text-[#2A201A] transition-all hover:bg-[#2A201A]/5 active:scale-95"
                        >
                            Products
                        </Link>
                        <Link
                            href="/maintenance"
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-3.5 text-[16px] font-bold tracking-wide text-[#2A201A] transition-all hover:bg-[#2A201A]/5 active:scale-95"
                        >
                            Maintenance
                        </Link>

                        <div className="mt-8 pt-6 border-t border-[#D9C5B2]/30 flex flex-col gap-3">
                            <Link
                                href="/login?type=property"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl bg-[#2A201A] px-4 py-3.5 text-[15px] font-bold text-white transition-all hover:bg-black active:scale-95 shadow-md"
                            >
                                Property Team Login
                            </Link>
                            <Link
                                href="/login?type=visiting"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl border-2 border-[#2A201A] px-4 py-3.5 text-[15px] font-bold text-[#2A201A] transition-all hover:bg-[#D9C5B2]/20 active:scale-95 shadow-sm"
                            >
                                Visiting Team Login
                            </Link>
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
