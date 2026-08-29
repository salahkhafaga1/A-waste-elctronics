import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/shell";

export default function UnauthorizedPage() {
  return (
    <Shell>
      <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6 shadow-sm">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          غير مصرح بالدخول (403 Unauthorized)
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
          عذراً، لا تمتلك الصلاحيات الإدارية الكافية للوصول إلى هذه الصفحة. هذه المنطقة مخصصة لمدراء النظام فقط.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              الرجوع إلى لوحة التحكم
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
