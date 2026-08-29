import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Recycle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xl mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
            <Recycle className="h-6 w-6" />
          </div>
          <span>تدوير الإلكترونيات</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground">استعادة كلمة المرور</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور عبر رابط الأمان
        </p>
      </div>

      <SignIn
        path="/forgot-password"
        routing="path"
        signUpUrl="/register"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            headerTitle: "استعادة الحساب",
            headerSubtitle: "اتبع التعليمات لتسجيل الدخول بأمان",
          },
        }}
      />

      <div className="mt-6 text-center">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            العودة إلى تسجيل الدخول
          </Button>
        </Link>
      </div>
    </div>
  );
}
