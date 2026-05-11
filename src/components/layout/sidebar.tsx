"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { NavItem, NavGroup } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SidebarProps = {
  items?: NavItem[];
  groups?: NavGroup[];
  title: string;
  headerActions?: React.ReactNode;
};

function SidebarNavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isRootNav = item.href.split("/").filter(Boolean).length <= 1;
  const active = isRootNav
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition min-h-[40px]",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.title}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs text-navy">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarNavFlat({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <SidebarNavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function SidebarNavGrouped({
  groups,
  onNavigate,
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-4">
      {groups.map((group, idx) => (
        <div key={group.label}>
          {idx > 0 && <div className="mb-2 border-t border-border/60" />}
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 select-none">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarNavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ items, groups, title, headerActions }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const renderNav = (onNavigate?: () => void) =>
    groups ? (
      <SidebarNavGrouped groups={groups} onNavigate={onNavigate} />
    ) : items ? (
      <SidebarNavFlat items={items} onNavigate={onNavigate} />
    ) : null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-5 px-2 text-lg font-bold text-foreground">{title}</div>
          {renderNav()}
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="sticky top-0 z-20 border-b bg-card px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground">{title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex h-[calc(100%-4rem)] flex-col overflow-y-auto">
                {renderNav(() => setOpen(false))}
              </div>
            </SheetContent>
          </Sheet>
          <p className="font-semibold text-foreground truncate">{title}</p>
          {headerActions && (
            <div className="ml-auto flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
