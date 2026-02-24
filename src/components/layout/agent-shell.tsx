"use client";

import { agentNav, visitingAgentNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/home/theme-toggle";

export function AgentShell({ children, agentType = "property", userName }: { children: React.ReactNode, agentType?: string, userName?: string }) {
    const nav = agentType === "visiting" ? visitingAgentNav : agentNav;
    const title = agentType === "visiting" ? "Visiting Team" : "Agent Panel";

    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={nav} title={title} userName={userName} />
            <div>
                <header className="sticky top-0 z-20 border-b border-border bg-background/95 dark:bg-slate-950/95 px-4 py-3 backdrop-blur lg:px-6">
                    <div className="flex items-center justify-end">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
