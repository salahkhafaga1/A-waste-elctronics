import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Coins,
  Trees,
  HeartHandshake,
  ShoppingBag,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAllRedemptionsAdmin } from "@/lib/supabase/admin-queries";
import { REDEMPTION_STATUS_LABELS_AR } from "@/constants/rewards";
import { formatPoints } from "@/lib/utils";
import { RedemptionActions } from "@/components/admin/redemption-actions";

export const dynamic = "force-dynamic";

interface AdminRedemptionsPageProps {
  searchParams?: {
    status?: string;
  };
}

export default async function AdminRedemptionsPage({ searchParams }: AdminRedemptionsPageProps) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const currentStatus = searchParams?.status || "all";
  const redemptions = await getAllRedemptionsAdmin({ status: currentStatus });

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                إدارة التحويلات النقدية والمكافآت
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                مراجعة واعتماد طلبات السحب النقدي لمحافظ فودافون كاش وإنستاباي، وإدارة عمليات الاستبدال.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              إجمالي السجلات: <strong>{redemptions.length}</strong>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
            <Link
              href="/admin/redemptions"
              className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                currentStatus === "all"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              جميع العمليات
            </Link>

            {[
              { id: "pending", label: "قيد المراجعة والتحويل" },
              { id: "completed", label: "مكتملة ومحولة" },
              { id: "rejected", label: "مرفوضة / مستردة" },
            ].map((st) => (
              <Link
                key={st.id}
                href={`/admin/redemptions?status=${st.id}`}
                className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  currentStatus === st.id
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.label}
              </Link>
            ))}
          </div>

          {/* Redemptions List */}
          {redemptions.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-muted/10">
              <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">لا توجد سجلات في هذا التصنيف</h3>
              <p className="text-xs text-muted-foreground mt-1">
                اختر تبويباً آخر أو راجع جميع العمليات.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {redemptions.map((red) => {
                const statusInfo = REDEMPTION_STATUS_LABELS_AR[red.status] || {
                  label: red.status,
                  badgeVariant: "secondary" as const,
                };
                const category = red.reward?.category || red.metadata?.reward_category || "voucher";

                return (
                  <Card
                    key={red.id}
                    className="hover:border-rose-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold font-mono text-sm text-foreground">
                            {red.voucher_code}
                          </span>
                          <Badge variant={statusInfo.badgeVariant} className="text-[10px]">
                            {statusInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(red.created_at).toLocaleDateString("ar-EG")}
                          </span>
                        </div>

                        {/* Title & User info */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground">
                            {red.reward?.title_ar || red.metadata?.reward_title || "مكافأة"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 text-foreground font-medium">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {red.user?.full_name || red.user?.email || "مستخدم"}
                            </span>
                            {red.metadata?.payout_phone && (
                              <span className="flex items-center gap-1 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Phone className="h-3 w-3 text-amber-700" />
                                المحفظة: <span dir="ltr" className="font-mono">{red.metadata.payout_phone}</span>
                              </span>
                            )}
                            {red.metadata?.dedication_name && (
                              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                إهداء الشجرة باسم: <strong>{red.metadata.dedication_name}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Points & Monetary info */}
                        <div className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
                          <span>
                            المبلغ:{" "}
                            <strong className="font-mono text-foreground font-bold text-sm">
                              {red.reward?.monetary_value || red.metadata?.monetary_value || 50} جنيه مصري
                            </strong>
                          </span>
                          <span>
                            النقاط المستبدلة:{" "}
                            <strong className="font-mono text-rose-700">
                              {formatPoints(red.points_spent)} نقطة
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="pt-3 md:pt-0 border-t md:border-t-0 flex items-center justify-end">
                        <RedemptionActions redemption={red} />
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
