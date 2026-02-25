import {
  Building2,
  LayoutDashboard,
  Package,
  Calendar,
  ShoppingBag,
  Users,
  ScrollText,
  Wrench,
  MessageSquare,
  MapPin,
  Star,
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

export const visitingAgentNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Assignments", href: "/agent/assignments", icon: MapPin },
  { title: "My Properties", href: "/agent/properties-assigned", icon: Building2 },
];

export const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "AQARI Team", href: "/admin/agents", icon: Users },
  { title: "Visiting Team", href: "/admin/visiting-team", icon: MapPin },
  { title: "Properties", href: "/admin/properties", icon: Building2 },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Visit Requests", href: "/admin/visits", icon: Calendar },
  { title: "Buy Requests", href: "/admin/leads", icon: ShoppingBag },
  { title: "Maintenance", href: "/admin/maintenance", icon: Wrench },
  { title: "Testimonials", href: "/admin/testimonials", icon: Star },
  { title: "Message Logs", href: "/admin/logs", icon: MessageSquare },
  { title: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
];

export const publicNav = [
  { title: "Home", href: "/" },
  { title: "Properties", href: "/properties" },
  { title: "Products", href: "/products" },
  { title: "Maintenance", href: "/maintenance" },
];
