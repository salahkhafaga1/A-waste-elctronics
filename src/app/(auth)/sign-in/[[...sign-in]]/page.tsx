import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Recycle } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xl mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
            <Recycle className="h-6 w-6" />
          </div>
          <span>تدوير الإلكترونيات</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          سجل دخولك لإدارة حسابك ونقاط إعادة التدوير
        </p>
      </div>

      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
