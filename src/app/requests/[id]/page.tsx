import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  PackageCheck,
  Coins,
  Scale,
  Sparkles,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  User,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCollectionRequestById } from "@/lib/supabase/requests";
import { getPickupAssignmentByRequestId } from "@/lib/supabase/partners";
import { REQUEST_STATUS_BADGES_AR, REQUEST_TIMELINE_STEPS, ITEM_CONDITION_LABELS_AR } from "@/constants/waste";
import { PICKUP_STATUS_LABELS_AR } from "@/constants/partners";
import { formatPoints } from "@/lib/utils";
import type { RequestStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

const STATUS_ORDER: Record<RequestStatus, number> = {
  pending: 0,
  confirmed: 1,
  assigned: 2,
  collected: 3,
  verified: 4,
  recycled: 5,
  cancelled: -1,
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect(`/login?redirect_url=/requests/${params.id}`);
  }

  const [request, pickupAssignment] = await Promise.all([
    getCollectionRequestById(params.id),
    getPickupAssignmentByRequestId(params.id),
  ]);

  if (!request) {
    notFound();
  }

  // Security: Only owner or admin can view
  const isAdmin = user.publicMetadata?.role === "admin" || user.privateMetadata?.role === "admin";
  if (request.user_id !== user.id && !isAdmin) {
    redirect("/unauthorized");
  }

  const currentStepIndex = STATUS_ORDER[request.status];
  const isCancelled = request.status === "cancelled";
  const statusInfo = REQUEST_STATUS_BADGES_AR[request.status] || {
    label: request.status,
    badgeVariant: "secondary" as const,
  };

  const pickupStatusInfo = pickupAssignment
    ? PICKUP_STATUS_LABELS_AR[pickupAssignment.status] || {
        label: pickupAssignment.status,
        badgeVariant: "secondary" as const,
      }
    : null;

  return (
    <Shell>
      <div className="container py-10 max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Truck className="h-3.5 w-3.5" />
              <span>تفاصيل ومسار الشحنة</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                طلب #{request.id.slice(0, 8)}
              </h1>
              <Badge variant={statusInfo.badgeVariant} className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              تم الإنشاء في: {new Date(request.created_at).toLocaleString("ar-EG", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>

          <Link href="/requests">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              العودة لقائمة الطلبات
            </Button>
          </Link>
        </div>

        {/* Assigned Pickup & Driver Card (If scheduled/assigned) */}
        {pickupAssignment && (
          <Card className="border-emerald-300 bg-gradient-to-r from-emerald-500/10 via-card to-card overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-emerald-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-950">
                  <Truck className="h-4 w-4 text-emerald-700" />
                  بيانات المندوب والزيارة الميدانية المجدولة
                </CardTitle>
                <Badge variant={pickupStatusInfo?.badgeVariant} className="text-[10px]">
                  {pickupStatusInfo?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">شريك الشحن واللوجستيات:</span>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  {pickupAssignment.partner?.name_ar || "أسطول التدوير الأخضر"}
                </p>
              </div>

              {pickupAssignment.scheduled_at && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">الموعد المحدد للزيارة:</span>
                  <p className="font-bold text-foreground font-mono text-sm flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                    {new Date(pickupAssignment.scheduled_at).toLocaleString("ar-EG", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}

              {pickupAssignment.driver_name && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">اسم المندوب:</span>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {pickupAssignment.driver_name}
                  </p>
                </div>
              )}

              {pickupAssignment.driver_phone && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">هاتف المندوب المباشر:</span>
                  <p className="font-mono font-bold text-emerald-800 flex items-center gap-1.5" dir="ltr">
                    <Phone className="h-3.5 w-3.5 text-emerald-700" />
                    {pickupAssignment.driver_phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Visual Interactive Tracking Timeline */}
        <Card className="p-6 overflow-hidden">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              خطوات تنفيذ الطلب
            </CardTitle>
            <CardDescription className="text-xs">
              تتبع المسار الميداني للشحنة من لحظة التسجيل وحتى المعالجة والتدوير النهائي.
            </CardDescription>
          </CardHeader>

          {isCancelled ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-xs">
                <strong>تم إلغاء هذا الطلب.</strong>
                <p className="mt-0.5">يمكنك إنشاء طلب جديد في أي وقت لتسليم أجهزتك الإلكترونية.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop Progress Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {REQUEST_TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                          : isCompleted
                          ? "border-emerald-200 bg-emerald-50/20 text-foreground"
                          : "border-muted bg-muted/10 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold mb-2 ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className="text-xs font-bold leading-tight">{step.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Points & Weight Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  وزن المخلفات
                </span>
                {request.verified_weight !== null && (
                  <Badge variant="default" className="text-[10px]">
                    وزن معتمد
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-black text-foreground font-mono">
                  {request.verified_weight !== null ? request.verified_weight : request.estimated_weight}{" "}
                  <span className="text-sm font-normal text-muted-foreground">كجم</span>
                </div>
                {request.verified_weight !== null && request.verified_weight !== request.estimated_weight && (
                  <span className="text-xs text-muted-foreground line-through">
                    تقديري: {request.estimated_weight} كجم
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {request.verified_weight !== null
                  ? "تم اعتماد الوزن رسمياً بعد الوزن الفعلي لدى المندوب."
                  : "وزن تقديري محسوب بناءً على متوسطات الأجهزة المختارة."}
              </p>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="shadow-sm border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-card to-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  نقاط المكافأة
                </span>
                {request.final_points !== null && (
                  <Badge variant="default" className="text-[10px]">
                    نقاط مودعة
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {formatPoints(request.final_points !== null ? request.final_points : request.estimated_points)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">نقطة</span>
                </div>
                {request.final_points !== null && request.final_points !== request.estimated_points && (
                  <span className="text-xs text-muted-foreground line-through">
                    تقديري: {formatPoints(request.estimated_points)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {request.final_points !== null
                  ? "تم إيداع النقاط في محفظتك بنجاح ومتاحة للاستبدال."
                  : "سيتم تحويل النقاط التقديرية إلى رصيدك فور فحص المندوب."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Items List Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald-600" />
              قائمة الأجهزة في هذا الطلب ({request.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {request.items && request.items.length > 0 ? (
              request.items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{item.item_name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        الكمية: {item.quantity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      الحالة: <strong className="text-foreground">{ITEM_CONDITION_LABELS_AR[item.condition]?.label || item.condition}</strong>
                      {" • "}
                      الوزن التقديري: {item.weight} كجم
                    </p>
                  </div>

                  {item.image_url && (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.item_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                لا توجد تفاصيل أصناف مسجلة.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Contact Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              بيانات موقع الاستلام والتواصل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">المحافظة والمدينة</span>
              <p className="font-semibold text-sm text-foreground">
                {request.governorate} — {request.city}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">العنوان التفصيلي</span>
              <p className="font-semibold text-sm text-foreground">
                {request.address}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">رقم الهاتف للتواصل</span>
              <p className="font-semibold text-sm font-mono text-foreground" dir="ltr">
                {request.phone}
              </p>
            </div>

            {request.notes && (
              <div className="space-y-1">
                <span className="text-muted-foreground">ملاحظات العميل / المندوب</span>
                <p className="font-medium text-foreground bg-muted/40 p-2.5 rounded-lg">
                  {request.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
