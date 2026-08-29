import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Truck,
  Scale,
  Coins,
  Wallet,
  Recycle,
  Gift,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/clerk/roles";
import {
  getAdminDashboardMetrics,
  getAllRequestsAdmin,
  getAllRedemptionsAdmin,
} from "@/lib/supabase/admin-queries";
import { REQUEST_STATUS_LABELS_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const [metrics, recentRequests, recentRedemptions] = await Promise.all([
    getAdminDashboardMetrics(),
    getAllRequestsAdmin({ status: "pending" }),
    getAllRedemptionsAdmin({ status: "pending" }),
  ]);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Admin Navigation Bar */}
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>لوحة العمليات والإدارة المركزية</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                لوحة تحكم الإدارة (Operations Dashboard)
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                متابعة مؤشرات الأداء، وفحص واعتماد طلبات الجمع، وتحويلات الكاش، وإدارة التسعير.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  لوحة المستخدم
                </Button>
              </Link>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-amber-200/80 bg-amber-50/30">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs text-amber-900 font-semibold flex items-center justify-between">
                  <span>طلبات الجمع المعلقة</span>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black text-amber-700">{metrics.pendingRequests}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">من إجمالي {metrics.totalRequests} طلب</p>
              </CardContent>
            </Card>

            <Card className="border-rose-200/80 bg-rose-50/30">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs text-rose-900 font-semibold flex items-center justify-between">
                  <span>سحب كاش قيد المراجعة</span>
                  <Wallet className="h-4 w-4 text-rose-600" />
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black text-rose-700">{metrics.pendingRedemptions}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">تتطلب تحويل فودافون كاش / إنستاباي</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200/80 bg-emerald-50/30">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs text-emerald-900 font-semibold flex items-center justify-between">
                  <span>المخلفات المعتمدة</span>
                  <Scale className="h-4 w-4 text-emerald-600" />
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  {metrics.verifiedWasteKg} <span className="text-xs font-normal">كجم</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">تم تدوير {metrics.recycledWasteKg} كجم</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200/80 bg-blue-50/30">
              <CardHeader className="p-4 pb-1">
                <CardDescription className="text-xs text-blue-900 font-semibold flex items-center justify-between">
                  <span>إجمالي المستخدمين</span>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black text-blue-700">{metrics.totalUsers}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  منح {formatPoints(metrics.totalPointsAwarded)} نقطة
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Queues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Requests Queue */}
            <Card>
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-600" />
                    طلبات الجمع الجديدة ({recentRequests.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    طلبات واردة من المستخدمين بانتظار التأكيد أو الاعتماد
                  </CardDescription>
                </div>
                <Link href="/admin/requests">
                  <Button variant="ghost" size="sm" className="text-xs text-amber-800">
                    عرض الكل
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {recentRequests.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    لا توجد طلبات جمع معلقة حالياً.
                  </div>
                ) : (
                  recentRequests.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{req.user?.full_name || req.user?.email || "عميل"}</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-300">
                            {req.governorate}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          الوزن التقديري: {req.estimated_weight} كجم ({req.items?.length || 1} عناصر)
                        </p>
                      </div>

                      <Link href={`/admin/requests/${req.id}`}>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                          فحص واعتماد
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Pending Redemptions Queue */}
            <Card>
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-rose-600" />
                    طلبات التحويل النقدي المعلقة ({recentRedemptions.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    مستحقات كاش للمستخدمين تتطلب التحويل اليدوي (MVP)
                  </CardDescription>
                </div>
                <Link href="/admin/redemptions">
                  <Button variant="ghost" size="sm" className="text-xs text-rose-800">
                    عرض الكل
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {recentRedemptions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    لا توجد طلبات سحب نقدي معلقة حالياً.
                  </div>
                ) : (
                  recentRedemptions.slice(0, 4).map((red) => (
                    <div
                      key={red.id}
                      className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{red.user?.full_name || red.user?.email || "مستخدم"}</span>
                          <strong className="text-emerald-700 font-mono">
                            {red.reward?.monetary_value || red.metadata?.monetary_value || 50} جنيه
                          </strong>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          المحفظة: <span dir="ltr" className="font-mono">{red.metadata?.payout_phone || "غير محدد"}</span>
                        </p>
                      </div>

                      <Link href="/admin/redemptions">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8">
                          مراجعة وتحويل
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/waste" className="block">
              <Card className="hover:border-emerald-300 hover:shadow-sm transition-all p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Recycle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">دليل وتسعير المخلفات</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">تعديل التصنيفات ونقاط الكيلوجرام</p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/rewards" className="block">
              <Card className="hover:border-emerald-300 hover:shadow-sm transition-all p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">إدارة متجر المكافآت</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">إضافة قسائم جديدة والتحكم بالمخزون</p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/users" className="block">
              <Card className="hover:border-emerald-300 hover:shadow-sm transition-all p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">المستخدمين والرتب</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">تعيين المسؤولين ومراقبة الأرصدة</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
