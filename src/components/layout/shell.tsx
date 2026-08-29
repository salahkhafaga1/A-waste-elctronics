import React from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
}

export function Shell({ children, className, hideFooter = false }: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className={cn("flex-1", className)}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
