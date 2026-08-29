"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Wallet,
  Recycle,
  Gift,
  Users,
  MapPin,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "نظرة عامة والتقارير", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "طلبات الجمع والاعتماد", icon: Truck },
  { href: "/admin/partners", label: "الشركاء واللوجستيات", icon: Building2 },
  { href: "/admin/redemptions", label: "التحويلات والمكافآت", icon: Wallet },
  { href: "/admin/waste", label: "دليل وتسعير المخلفات", icon: Recycle },
  { href: "/admin/rewards", label: "المكافآت والشركاء", icon: Gift },
  { href: "/admin/users", label: "المستخدمين والأدوار", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-card">
      <div className="container overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-2 py-2">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-amber-100 text-amber-900 shadow-sm border border-amber-200"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-amber-700" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
