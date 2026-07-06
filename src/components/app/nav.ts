import {
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
