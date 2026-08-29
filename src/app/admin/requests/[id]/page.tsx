import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  ArrowRight,
  Scale,
  Coins,
  MapPin,
  Phone,
  User,
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAdminRequestDetails } from "@/lib/supabase/admin-queries";
import {
  getPickupAssignmentByRequestId,
  getAllPartners,
} from "@/lib/supabase/partners";
import { REQUEST_STATUS_BADGES_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";
import { RequestActions } from "@/components/admin/request-actions";
import { PickupAssignmentWidget } from "@/components/admin/pickup-assignment-widget";

export const dynamic = "force-dynamic";

interface AdminRequestDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AdminRequestDetailPage({ params }: AdminRequestDetailPageProps) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const [request, pickupAssignment, allPartners] = await Promise.all([
    getAdminRequestDetails(params.id),
    getPickupAssignmentByRequestId(params.id),
    getAllPartners({ status: "active" }),
  ]);

  if (!request) {
    notFound();
  }

  const statusInfo = REQUEST_STATUS_BADGES_AR[request.status] || {
    label: request.status,
    badgeVariant: "secondary" as const,
  };

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-5xl space-y-6">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-mono">طلب رقم #{request.id.slice(0, 8)}</span>
                <Badge variant={statusInfo.badgeVariant} className="text-[10px]">
                  {statusInfo.label}
                </Badge>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">فحص واعتماد طلب الجمع</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/requests">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  العودة للطلبات
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Control Panel */}
          <Card className="border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-card to-card">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  إجراءات الإدارة والفحص الفيزيائي
                </h3>
                <p className="text-xs text-muted-foreground">
                  {request.status === "verified"
                    ? `تم اعتماد هذا الطلب بوزن ${request.verified_weight} كجم ومُنح ${request.final_points} نقطة بنجاح.`
                    : "قم بفحص الأجهزة المرفقة وإدخال الوزن المعتمد النهائي لمنح النقاط للعميل."}
                </p>
              </div>

              <RequestActions request={request} />
            </CardContent>
          </Card>

          {/* Pickup & Logistics Assignment Section */}
          <PickupAssignmentWidget
            requestId={request.id}
            currentAssignment={pickupAssignment}
            availablePartners={allPartners}
          />

          {/* Client & Address Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="p-5 pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-600" />
                  بيانات العميل وحسابه
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الاسم بالكامل:</span>
                  <span className="font-semibold text-foreground">{request.user?.full_name || "غير محدد"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني:</span>
                  <span className="font-mono">{request.user?.email || "غير متوفر"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">رقم الهاتف للتواصل:</span>
                  <span className="font-mono font-bold" dir="ltr">{request.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">رصيد نقاط العميل الحالي:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatPoints(request.user?.points_balance || 0)} نقطة
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  عنوان الاستلام والموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المحافظة:</span>
                  <span className="font-semibold text-foreground">{request.governorate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المدينة / الحي:</span>
                  <span className="font-semibold text-foreground">{request.city}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">العنوان بالتفصيل:</span>
                  <p className="font-medium text-foreground bg-muted/30 p-2 rounded border">
                    {request.address}
                  </p>
                </div>
                {request.notes && (
                  <div className="space-y-1 pt-1">
                    <span className="text-muted-foreground">ملاحظات العميل:</span>
                    <p className="text-muted-foreground italic bg-muted/20 p-2 rounded">
                      {request.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Waste Items Inspection List */}
          <Card>
            <CardHeader className="p-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-600" />
                  الأجهزة والمخلفات المرفقة ({request.items?.length || 0})
                </CardTitle>
                <span className="text-xs text-muted-foreground font-mono">
                  الوزن التقديري الإجمالي: <strong>{request.estimated_weight} كجم</strong>
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {request.items?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  لا توجد تفاصيل عناصر مرفقة بهذا الطلب.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {request.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border bg-muted/10 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {item.image_url ? (
                          <div className="relative h-36 w-full rounded-lg overflow-hidden border mb-3 bg-card">
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-full rounded-lg border border-dashed flex items-center justify-center text-muted-foreground text-xs mb-3 bg-muted/20">
                            لا توجد صورة مرفقة
                          </div>
                        )}

                        <h4 className="font-bold text-sm text-foreground">{item.item_name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                          <div>
                            الكمية: <strong className="text-foreground">{item.quantity}</strong>
                          </div>
                          <div>
                            الوزن: <strong className="text-foreground">{item.weight} كجم</strong>
                          </div>
                          <div className="col-span-2">
                            الحالة:{" "}
                            <Badge variant="outline" className="text-[10px]">
                              {item.condition === "working"
                                ? "يعمل"
                                : item.condition === "broken"
                                ? "معطل / به كسر"
                                : "خردة / سكراب"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
