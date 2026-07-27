import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  Warehouse,
  FileText,
  Receipt,
  FileStack,
  ShoppingCart,
  Truck,
  FolderArchive,
  Archive,
  Bot,
  Settings,
  Wallet,
} from "lucide-react";

import type { AppRole } from "@/types/database";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "core" | "sales" | "inventory" | "system";
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "core" },
  { label: "Customers", href: "/customers", icon: Users, group: "core" },
  { label: "Products", href: "/products", icon: Package, group: "inventory" },
  { label: "Price Lists", href: "/price-lists", icon: Tags, group: "inventory" },
  { label: "Warehouse", href: "/warehouse", icon: Warehouse, group: "inventory" },
  { label: "Quotations", href: "/quotations", icon: FileText, group: "sales" },
  { label: "Budgets", href: "/budgets", icon: Wallet, group: "sales" },
  { label: "Invoices", href: "/invoices", icon: Receipt, group: "sales" },
  { label: "Advance Invoices", href: "/advance-invoices", icon: FileStack, group: "sales" },
  { label: "Orders", href: "/orders", icon: ShoppingCart, group: "sales" },
  { label: "Delivery Notes", href: "/delivery-notes", icon: Truck, group: "sales" },
  { label: "Documents", href: "/documents", icon: FolderArchive, group: "system" },
  { label: "Archive", href: "/archive", icon: Archive, group: "system" },
  { label: "AI Assistant", href: "/assistant", icon: Bot, group: "system" },
  { label: "Settings", href: "/settings", icon: Settings, group: "system" },
];

export const NAV_GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "core", label: "Overview" },
  { id: "sales", label: "Sales" },
  { id: "inventory", label: "Inventory" },
  { id: "system", label: "System" },
];

export const ROLE_LABELS: Record<AppRole, string> = {
  administrator: "Administrator",
  manager: "Manager",
  accountant: "Accountant",
  warehouse: "Warehouse",
  sales: "Sales",
};

export const VAT_RATES = [0, 12, 21] as const;
