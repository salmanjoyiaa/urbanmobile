"use client";

import { agentNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";

export function AgentShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={agentNav} title="Agent Panel" />
            <main className="p-4 lg:p-6">{children}</main>
        </div>
    );
}
