"use client";

import { adminNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";

export function AdminShell({ children, userName }: { children: React.ReactNode, userName?: string }) {
    const actions = (
        <>
            <NotificationBell />
            <UserMenu userName={userName} role="Admin" />
        </>
    );

    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={adminNav} title="Admin Panel" headerActions={actions} />
            <div>
                <header className="sticky top-0 z-20 hidden border-b border-border bg-background/95 dark:bg-slate-950/95 px-4 py-2.5 backdrop-blur sm:py-3 lg:block lg:px-6">
                    <div className="flex items-center justify-end gap-3">
                        <NotificationBell />
                        <UserMenu userName={userName} role="Admin" />
                    </div>
                </header>
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

