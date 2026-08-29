"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Recycle, LayoutDashboard, ShieldAlert, LogIn, UserPlus, Menu, X, UserCog, PlusCircle, Coins, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const role = (user?.publicMetadata?.role || (user as any)?.privateMetadata?.role) as string | undefined;
  const isAdmin = role === "admin";

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/request", label: "طلب جمع مخلفات", highlight: true },
    { href: "/collection-points", label: "نقاط التجميع" },
    { href: "/rewards", label: "المكافآت" },
    { href: "/requests", label: "طلباتي", authOnly: true },
    { href: "/points", label: "نقاطي", authOnly: true },
    { href: "/dashboard", label: "لوحة التحكم", authOnly: true },
    { href: "/admin", label: "الإدارة", adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse font-bold text-lg text-emerald-700">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Recycle className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-extrabold tracking-tight leading-tight">تدوير الإلكترونيات</span>
              <span className="text-[10px] text-muted-foreground font-normal">E-Waste Egypt</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null;
              if (link.authOnly && !user) return null;

              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    link.highlight && !isActive && "text-emerald-700 font-semibold hover:bg-emerald-50/70"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side / Auth Actions */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="flex items-center gap-2.5">
              <Link href="/request" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                  <PlusCircle className="h-4 w-4" />
                  طلب استلام جديد
                </Button>
              </Link>
              {isAdmin && (
                <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  <ShieldAlert className="h-3 w-3" />
                  مسؤول
                </span>
              )}
              <Link href="/points" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="gap-1.5 text-emerald-700 font-semibold">
                  <Coins className="h-4 w-4" />
                  محفظتي
                </Button>
              </Link>
              <Link href="/dashboard/profile" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <UserCog className="h-4 w-4" />
                  حسابي
                </Button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                userProfileUrl="/dashboard/profile"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-emerald-500/20",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <UserPlus className="h-4 w-4" />
                  حساب جديد
                </Button>
              </Link>
            </div>
          </SignedOut>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null;
              if (link.authOnly && !user) return null;

              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium text-start",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <SignedIn>
            <div className="pt-2 border-t">
              <Link href="/request" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  طلب استلام جديد
                </Button>
              </Link>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="pt-2 border-t flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                  إنشاء حساب جديد
                </Button>
              </Link>
            </div>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
