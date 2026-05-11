"use client";

import { agentNav, visitingAgentNav, sellerNav, maintenanceNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";

import { UserMenu } from "@/components/layout/user-menu";

export function AgentShell({ children, agentType = "property", userName }: { children: React.ReactNode, agentType?: string, userName?: string }) {
    const nav = agentType === "visiting" ? visitingAgentNav : agentType === "seller" ? sellerNav : agentType === "maintenance" ? maintenanceNav : agentNav;
    const title = agentType === "visiting" ? "Visiting Team" : agentType === "seller" ? "Seller Panel" : agentType === "maintenance" ? "Maintenance Panel" : "Agent Panel";
    const roleLabel = agentType === "visiting" ? "Visiting Agent" : agentType === "seller" ? "Seller" : agentType === "maintenance" ? "Maintenance Agent" : "Agent";

    const actions = (
        <>
            <UserMenu userName={userName} role={roleLabel} />
        </>
    );

    return (
        <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
            <Sidebar items={nav} title={title} headerActions={actions} />
            <div>
                <header className="sticky top-0 z-20 hidden border-b border-border bg-background/95 dark:bg-slate-950/95 px-4 py-2.5 backdrop-blur sm:py-3 lg:block lg:px-6">
                    <div className="flex items-center justify-end gap-3">
                        <UserMenu userName={userName} role={roleLabel} />
                    </div>
                </header>
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

