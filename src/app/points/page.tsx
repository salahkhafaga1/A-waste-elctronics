import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  PlusCircle,
  Clock,
  Sparkles,
  TrendingUp,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserPointsLedger, getUserPointsSummary } from "@/lib/supabase/points";
import { getProfileByClerkId } from "@/lib/supabase/profiles";
import { TRANSACTION_TYPE_LABELS_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login?redirect_url=/points");
  }

  const [profile, summary, ledger] = await Promise.all([
    getProfileByClerkId(user.id),
    getUserPointsSummary(user.id),
    getUserPointsLedger(user.id),
  ]);

  const currentBalance = profile?.points_balance ?? summary.currentBalance;

  return (
    <Shell>
      <div className="container py-10 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>محفظة النقاط والمكافآت</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              سجل النقاط والمعاملات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              دفتر الأستاذ الرسمي والمحدث لجميع النقاط المكتسبة والمستبدلة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/request">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                اكسب نقاط جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Current Balance */}
          <Card className="border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">
                الرصيد المتاح حالياً
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-600">
                {formatPoints(currentBalance)} <span className="text-base font-normal text-muted-foreground">نقطة</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                رصيد موثق في دفتر المعاملات
              </p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">
                إجمالي النقاط المكتسبة
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">
                {formatPoints(summary.totalEarned)} <span className="text-base font-normal text-muted-foreground">نقطة</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                من تسليم الأجهزة والمكافآت الترحيبية
              </p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">
                إجمالي النقاط المستبدلة
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Gift className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">
                {formatPoints(summary.totalSpent)} <span className="text-base font-normal text-muted-foreground">نقطة</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                مقابل كوبونات ومكافآت شركاء النجاح
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sprint 4 Reward Preview Banner */}
        <Card className="border-emerald-200 bg-emerald-50/40 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow shrink-0">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">متجر المكافآت وكوبونات الخصم</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  استبدل نقاطك بقسائم شراء لدى المتاجر الإلكترونية، خصومات على فواتير الإنترنت، ومكافآت حصرية في <strong>Sprint 4</strong>.
                </p>
              </div>
            </div>
            <Link href="/request">
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                جمع مزيد من النقاط
              </Button>
            </Link>
          </div>
        </Card>

        {/* Authoritative Points Ledger Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  سجل حركات النقاط (Transactions Ledger)
                </CardTitle>
                <CardDescription className="text-xs">
                  سجل كامل ومفصل لجميع عمليات الإيداع والخصم وتغيير الرصيد.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {ledger.length} معاملة
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {ledger.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="font-bold text-base text-foreground">لا توجد حركات نقاط مسجلة بعد</h3>
                <p className="text-xs max-w-sm mx-auto">
                  قم بإنشاء أول طلب جمع أجهزة إلكترونية قديمة وسيتم إيداع النقاط مباشرة في محفظتك فور الاستلام.
                </p>
                <Link href="/request" className="inline-block pt-2">
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <PlusCircle className="h-4 w-4" />
                    طلب جمع أجهزة
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y text-xs">
                {ledger.map((tx) => {
                  const isCredit = tx.points > 0;
                  const typeInfo = TRANSACTION_TYPE_LABELS_AR[tx.type] || {
                    label: tx.type,
                    badgeVariant: "secondary" as const,
                  };

                  return (
                    <div
                      key={tx.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                            isCredit
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground text-sm">
                              {tx.description}
                            </span>
                            <Badge variant={typeInfo.badgeVariant} className="text-[10px]">
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(tx.created_at).toLocaleString("ar-EG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                        <span
                          className={`font-black font-mono text-base ${
                            isCredit ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? `+${formatPoints(tx.points)}` : formatPoints(tx.points)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          الرصيد بعد الحركة: <strong className="font-mono text-foreground">{formatPoints(tx.balance_after)}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
