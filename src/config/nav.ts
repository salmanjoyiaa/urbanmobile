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
  Clock,
  type LucideIcon,
  ClipboardList,
  Settings,
  FileText,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const agentNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Properties", href: "/agent/properties", icon: Building2 },
  { title: "Visit Requests", href: "/agent/visits", icon: Calendar },
];

export const visitingAgentNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Assignments", href: "/agent/assignments", icon: MapPin },
  { title: "My Properties", href: "/agent/properties-assigned", icon: Building2 },
];

export const sellerNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Products", href: "/agent/products", icon: Package },
  { title: "Product contacts", href: "/agent/leads", icon: ShoppingBag },
];

export const maintenanceNav: NavItem[] = [
  { title: "Overview", href: "/agent", icon: LayoutDashboard },
  { title: "My Services", href: "/agent/maintenance-services", icon: Wrench },
  { title: "Service Requests", href: "/agent/maintenance-requests", icon: ScrollText },
];

// Grouped admin navigation
export const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Team Management",
    items: [
      { title: "AQARI Team", href: "/admin/agents", icon: Users },
      { title: "Sellers", href: "/admin/agents?agent_type=seller", icon: ShoppingBag },
      { title: "Visiting Team", href: "/admin/visiting-team", icon: MapPin },
      { title: "Maintenance Agents", href: "/admin/agents?agent_type=maintenance", icon: Wrench },
    ],
  },
  {
    label: "Listings",
    items: [
      { title: "Properties", href: "/admin/properties", icon: Building2 },
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Locations", href: "/admin/locations", icon: MapPin },
      { title: "Maintenance Services", href: "/admin/maintenance-services", icon: Settings },
    ],
  },
  {
    label: "Requests",
    items: [
      { title: "Visit Requests", href: "/admin/visits", icon: Calendar },
      { title: "Product contacts", href: "/admin/leads", icon: ShoppingBag },
      { title: "Maintenance Requests", href: "/admin/maintenance", icon: ClipboardList },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Visit Hours", href: "/admin/slots", icon: Clock },
      { title: "Visit Performance", href: "/admin/visit-team-performance", icon: MapPin },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Testimonials", href: "/admin/testimonials", icon: Star },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Message Logs", href: "/admin/logs", icon: MessageSquare },
      { title: "Audit Log", href: "/admin/audit-log", icon: FileText },
    ],
  },
];

// Flat version for backward compatibility
export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items);

export const publicNav = [
  { title: "Home", href: "/" },
  { title: "Properties", href: "/properties" },
  { title: "Products", href: "/products" },
  { title: "Maintenance", href: "/maintenance" },
];
