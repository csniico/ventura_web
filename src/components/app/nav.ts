import {
  ShieldCheck,
  UserCog,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CalendarDays,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products & Services", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Business settings", icon: Settings },
];

/**
 * Platform-admin nav, rendered as a separate section and only for accounts the
 * API confirms are administrators (see useIsPlatformAdmin). Kept out of
 * NAV_ITEMS so the ordinary business nav is identical for everyone else.
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin/users", label: "Platform users", icon: ShieldCheck },
  { href: "/admin/profile", label: "Admin profile", icon: UserCog },
];
