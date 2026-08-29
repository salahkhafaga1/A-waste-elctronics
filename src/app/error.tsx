"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/shell";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <Shell>
      <div className="container py-20 max-w-xl text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1 rounded-full">
            حدث خطأ غير متوقع
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            نعتذر، واجهنا مشكلة أثناء معالجة الطلب
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            تم تسجيل الخطأ وسيقوم فريق التطوير بمراجعته فوراً. يمكنك إعادة المحاولة الآن.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button onClick={() => reset()} className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Link href="/">
            <Button variant="outline" className="text-xs gap-2">
              <Home className="h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
