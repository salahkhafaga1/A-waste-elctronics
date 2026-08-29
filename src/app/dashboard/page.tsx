import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Sparkles,
  CheckCircle2,
  UserCog,
  ArrowLeft,
  PlusCircle,
  PackageCheck,
  Clock,
  MapPin,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shell } from "@/components/layout/shell";
import { syncUserProfile } from "@/lib/supabase/profiles";
import { getCollectionRequestsByUser } from "@/lib/supabase/requests";
import { formatPoints } from "@/lib/utils";
import { ROLE_LABELS_AR } from "@/constants/roles";
import { REQUEST_STATUS_LABELS_AR } from "@/constants/waste";
import type { UserRole } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress || "";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;
  const phone = user.phoneNumbers?.[0]?.phoneNumber || null;

  // Synchronize Clerk user identity with Supabase profiles table
  const [profile, userRequests] = await Promise.all([
    syncUserProfile({
      clerkUserId: user.id,
      email: primaryEmail,
      fullName,
      phone,
    }),
    getCollectionRequestsByUser(user.id),
  ]);

  const role: UserRole = profile?.role || "user";
  const pointsBalance = profile?.points_balance ?? 0;

  return (
    <Shell>
      <div className="container py-10 space-y-8">
        {/* Page Header with Avatar & User Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.imageUrl}
              fallbackText={profile.full_name || profile.email}
              size="lg"
              className="ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="h-3 w-3" />
                <span>مرحباً بك، {profile.full_name || "مستخدم منصة تدوير"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                لوحة التحكم الرئيسية
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/request">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                طلب جمع جديد
              </Button>
            </Link>

            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <UserCog className="h-4 w-4 text-emerald-600" />
                الملف الشخصي
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Points Balance Card */}
          <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                رصيد النقاط المكتسبة
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-600">
                {formatPoints(pointsBalance)} <span className="text-base font-normal text-muted-foreground">نقطة</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                رصيدك الحالي المتاح للاستبدال بمكافآت متنوعة.
              </p>
            </CardContent>
          </Card>

          {/* Active Requests Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي طلبات الجمع
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">
                {userRequests.length} <span className="text-base font-normal text-muted-foreground">طلب</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {userRequests.filter((r) => r.status === "pending").length} طلبات قيد المراجعة حالياً
              </p>
            </CardContent>
          </Card>

          {/* Account Role Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                نوع الحساب والتوثيق
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">
                {ROLE_LABELS_AR[role]}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                الهوية موثقة عبر Clerk Auth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Collection Requests History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">طلبات جمع المخلفات السابقة</h2>
              <p className="text-xs text-muted-foreground">
                متابعة حالة طلبات الاستلام والنقاط المكتسبة
              </p>
            </div>
            <Link href="/request">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-700">
                <PlusCircle className="h-3.5 w-3.5" />
                طلب جديد
              </Button>
            </Link>
          </div>

          {userRequests.length === 0 ? (
            <Card className="border-dashed p-8 text-center bg-muted/10">
              <PackageCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-sm">لا توجد طلبات جمع مسجلة بعد</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                ابدأ الآن بتسليم أجهزتك الإلكترونية القديمة واكسب نقاط فورية قابلة للاستبدال بمكافآت.
              </p>
              <Link href="/request">
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <PlusCircle className="h-4 w-4" />
                  إنشاء أول طلب جمع
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm font-mono text-emerald-800">
                        {req.id.slice(0, 8)}...
                      </span>
                      <Badge variant="secondary" className="text-[11px]">
                        {REQUEST_STATUS_LABELS_AR[req.status]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(req.created_at).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{req.governorate} — {req.city} ({req.address})</span>
                      </div>
                      <div className="font-semibold">
                        النقاط التقديرية: <span className="font-mono text-emerald-700 font-bold">{formatPoints(req.estimated_points)} نقطة</span>
                      </div>
                    </div>

                    {req.items && req.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {req.items.map((item) => (
                          <span
                            key={item.id}
                            className="bg-muted px-2 py-0.5 rounded text-[11px] text-muted-foreground"
                          >
                            {item.item_name} ({item.quantity})
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
