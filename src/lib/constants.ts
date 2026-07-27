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
  { label: "Přehled", href: "/dashboard", icon: LayoutDashboard, group: "core" },
  { label: "Zákazníci", href: "/customers", icon: Users, group: "core" },
  { label: "Produkty", href: "/products", icon: Package, group: "inventory" },
  { label: "Ceník", href: "/price-lists", icon: Tags, group: "inventory" },
  { label: "Sklad", href: "/warehouse", icon: Warehouse, group: "inventory" },
  { label: "Cenové nabídky", href: "/quotations", icon: FileText, group: "sales" },
  { label: "Rozpočty", href: "/budgets", icon: Wallet, group: "sales" },
  { label: "Faktury", href: "/invoices", icon: Receipt, group: "sales" },
  { label: "Zálohové faktury", href: "/advance-invoices", icon: FileStack, group: "sales" },
  { label: "Objednávky", href: "/orders", icon: ShoppingCart, group: "sales" },
  { label: "Dodací listy", href: "/delivery-notes", icon: Truck, group: "sales" },
  { label: "Dokumenty", href: "/documents", icon: FolderArchive, group: "system" },
  { label: "Archiv", href: "/archive", icon: Archive, group: "system" },
  { label: "AI Asistent", href: "/assistant", icon: Bot, group: "system" },
  { label: "Nastavení", href: "/settings", icon: Settings, group: "system" },
];

export const NAV_GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "core", label: "Přehled" },
  { id: "sales", label: "Prodej" },
  { id: "inventory", label: "Sklad" },
  { id: "system", label: "Systém" },
];

export const ROLE_LABELS: Record<AppRole, string> = {
  administrator: "Administrátor",
  manager: "Manažer",
  accountant: "Účetní",
  warehouse: "Skladník",
  sales: "Obchodník",
};

export const VAT_RATES = [0, 12, 21] as const;
