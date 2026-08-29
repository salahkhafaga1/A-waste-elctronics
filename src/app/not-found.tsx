import Link from "next/link";
import { Recycle, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/shell";

export default function NotFound() {
  return (
    <Shell>
      <div className="container py-20 max-w-xl text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-emerald-600">
          <Recycle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            خطأ ٤٠٤ (404 Not Found)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            الصفحة المطلوبة غير موجودة
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            عذراً، الرابط الذي تبحث عنه قد تم نقله أو حذفه أو لم يعد متوفراً.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2">
              <Home className="h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
          <Link href="/request">
            <Button variant="outline" className="text-xs gap-2">
              طلب جمع مخلفات
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
