import {
  Building2,
  LayoutDashboard,
  Package,
  Calendar,
  ShoppingBag,
  Users,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const agentNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Properties", href: "/agent/properties", icon: Building2 },
  { title: "My Products", href: "/agent/products", icon: Package },
  { title: "Visit Requests", href: "/agent/visits", icon: Calendar },
  { title: "Buy Requests", href: "/agent/leads", icon: ShoppingBag },
];

export const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Agents", href: "/admin/agents", icon: Users },
  { title: "Properties", href: "/admin/properties", icon: Building2 },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Visit Requests", href: "/admin/visits", icon: Calendar },
  { title: "Buy Requests", href: "/admin/leads", icon: ShoppingBag },
  { title: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
];

export const publicNav = [
  { title: "Home", href: "/" },
  { title: "Properties", href: "/properties" },
  { title: "Products", href: "/products" },
];
