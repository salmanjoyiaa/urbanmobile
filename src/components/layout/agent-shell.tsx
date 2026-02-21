"use client";

import { agentNav, visitingAgentNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";

export function AgentShell({ children, agentType = "property" }: { children: React.ReactNode, agentType?: string }) {
    const nav = agentType === "visiting" ? visitingAgentNav : agentNav;
    const title = agentType === "visiting" ? "Visiting Team" : "Agent Panel";

    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={nav} title={title} />
            <main className="p-4 lg:p-6">{children}</main>
        </div>
    );
}
