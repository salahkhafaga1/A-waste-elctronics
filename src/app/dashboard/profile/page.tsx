import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/forms/profile-form";
import { syncUserProfile } from "@/lib/supabase/profiles";
import { ROLE_LABELS_AR } from "@/constants/roles";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress || "";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;
  const phone = user.phoneNumbers?.[0]?.phoneNumber || null;

  // Fetch or idempotently sync profile
  const profile = await syncUserProfile({
    clerkUserId: user.id,
    email: primaryEmail,
    fullName,
    phone,
  });

  return (
    <Shell>
      <div className="container py-10 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Sparkles className="h-3 w-3" />
              <span>إدارة الحساب</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              الملف الشخصي
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              عرض وتعديل معلومات حسابك، وبيانات التواصل الخاصة بطلبات الجمع.
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>

        {/* User Identity Header Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl border bg-card shadow-sm mb-8">
          <Avatar
            src={user.imageUrl}
            fallbackText={profile.full_name || profile.email}
            size="xl"
            className="ring-4 ring-emerald-500/10 shrink-0"
          />

          <div className="flex-1 text-center sm:text-start space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {profile.full_name || "مستخدم منصة تدوير"}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge variant="secondary">
                  {ROLE_LABELS_AR[profile.role]}
                </Badge>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  {formatPoints(profile.points_balance)} نقطة
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-mono">
              {profile.email}
            </p>

            <p className="text-xs text-muted-foreground">
              عضو منذ: {new Date(user.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Interactive Profile Form */}
        <ProfileForm initialProfile={profile} />
      </div>
    </Shell>
  );
}
