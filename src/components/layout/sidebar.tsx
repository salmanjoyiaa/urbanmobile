"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import type { NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SidebarProps = {
  items: NavItem[];
  title: string;
  userName?: string;
};

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isRootNav = item.href.split("/").filter(Boolean).length <= 1;
        const active = isRootNav
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
            {item.badge && (
              <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs text-navy">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ items, title, userName }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 border-r bg-card dark:bg-slate-950 lg:block">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 px-2 text-lg font-bold text-foreground">{title}</div>
          <SidebarNav items={items} />
          <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-border">
            {userName && (
              <div className="px-2 pb-1 text-sm font-medium text-muted-foreground truncate">
                {userName}
              </div>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="border-b bg-card dark:bg-slate-950 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card dark:bg-slate-950 border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground">{title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SidebarNav items={items} onNavigate={() => setOpen(false)} />
                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                  {userName && (
                    <div className="px-2 text-sm font-medium text-muted-foreground truncate">
                      {userName}
                    </div>
                  )}
                  <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <p className="font-semibold text-foreground">{title}</p>
        </div>
      </div>
    </>
  );
}
