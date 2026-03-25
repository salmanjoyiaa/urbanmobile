"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type UserMenuProps = {
  userName?: string;
  role?: string;
};

export function UserMenu({ userName, role }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="user-menu-trigger"
          className="group flex items-center gap-2.5 rounded-full border border-border/60 bg-background/80 pl-3 pr-1.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <span className="hidden sm:inline-block max-w-[120px] truncate text-muted-foreground group-hover:text-foreground transition-colors">
            {userName || "Account"}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[11px] font-bold text-primary-foreground shadow-inner ring-2 ring-background transition-transform group-hover:scale-105">
            {getInitials(userName)}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground shadow-inner">
              {getInitials(userName)}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              {userName && (
                <p className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </p>
              )}
              {role && (
                <p className="text-[11px] font-medium text-muted-foreground capitalize">
                  {role}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
