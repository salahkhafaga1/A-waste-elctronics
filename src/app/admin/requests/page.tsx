import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Calendar,
  Scale,
  Coins,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAllRequestsAdmin } from "@/lib/supabase/admin-queries";
import { REQUEST_STATUS_BADGES_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AdminRequestsPageProps {
  searchParams?: {
    status?: string;
  };
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const currentStatus = searchParams?.status || "all";
  const requests = await getAllRequestsAdmin({ status: currentStatus });

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">إدارة طلبات الجمع والاعتماد</h1>
              <p className="text-xs text-muted-foreground mt-1">
                متابعة خط سير الطلبات، وفحص الأجهزة المستلمة، واعتماد الأوزان والنقاط النهائية.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              إجمالي الطلبات المعروضة: <strong>{requests.length}</strong>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
            <Link
              href="/admin/requests"
              className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                currentStatus === "all"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              جميع الحالات
            </Link>

            {[
              { id: "pending", label: "قيد الانتظار" },
              { id: "confirmed", label: "تم التأكيد" },
              { id: "assigned", label: "معين لمندوب" },
              { id: "collected", label: "تم الاستلام" },
              { id: "verified", label: "معتمد وموزون" },
              { id: "recycled", label: "تم التدوير" },
              { id: "cancelled", label: "ملغي" },
            ].map((st) => (
              <Link
                key={st.id}
                href={`/admin/requests?status=${st.id}`}
                className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  currentStatus === st.id
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.label}
              </Link>
            ))}
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-muted/10">
              <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">لا توجد طلبات في هذا التصنيف</h3>
              <p className="text-xs text-muted-foreground mt-1">
                تصفح الحالات الأخرى للتحقق من جميع الطلبات المسجلة.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const statusInfo = REQUEST_STATUS_BADGES_AR[req.status] || {
                  label: req.status,
                  badgeVariant: "secondary" as const,
                };

                return (
                  <Card
                    key={req.id}
                    className="hover:border-amber-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold font-mono text-sm text-foreground">
                            #{req.id.slice(0, 8)}
                          </span>
                          <Badge variant={statusInfo.badgeVariant} className="text-[10px]">
                            {statusInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(req.created_at).toLocaleDateString("ar-EG")}
                          </span>
                        </div>

                        {/* Customer & Location Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <User className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                            <span>{req.user?.full_name || req.user?.email || "عميل غير مسجل"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span dir="ltr" className="font-mono">{req.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{req.governorate} — {req.city} ({req.address})</span>
                          </div>
                        </div>

                        {/* Items summary */}
                        <div className="text-[11px] text-muted-foreground pt-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">العناصر ({req.items?.length || 0}):</span>
                          {req.items?.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="bg-muted px-2 py-0.5 rounded">
                              {item.item_name} ({item.quantity}x)
                            </span>
                          ))}
                          {(req.items?.length || 0) > 3 && (
                            <span>+{req.items.length - 3} أخرى</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Metrics & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                        <div className="text-start sm:text-end space-y-1">
                          <div className="text-xs">
                            <span className="text-muted-foreground">الوزن: </span>
                            <strong className="font-mono text-foreground font-bold">
                              {req.verified_weight ? `${req.verified_weight} كجم (معتمد)` : `${req.estimated_weight} كجم (تقديري)`}
                            </strong>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">النقاط: </span>
                            <strong className="font-mono text-emerald-700 font-bold">
                              {req.final_points ? formatPoints(req.final_points) : formatPoints(req.estimated_points)} نقطة
                            </strong>
                          </div>
                        </div>

                        <Link href={`/admin/requests/${req.id}`}>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 h-8">
                            <Eye className="h-3.5 w-3.5" />
                            فحص واعتماد
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
