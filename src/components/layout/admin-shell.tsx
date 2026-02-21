"use client";

import { adminNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";

export function AdminShell({ children, userName }: { children: React.ReactNode, userName?: string }) {
    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={adminNav} title="Admin Panel" userName={userName} />
            <div>
                <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
                    <div className="flex items-center justify-end">
                        <NotificationBell />
                    </div>
                </header>
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
