import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { History, ShoppingBag, PlusCircle, Coins, Award } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { VoucherList } from "@/components/rewards/voucher-list";
import { getUserRedemptions } from "@/lib/supabase/rewards";
import { getProfileByClerkId } from "@/lib/supabase/profiles";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RewardsHistoryPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login?redirect_url=/rewards/history");
  }

  const [vouchers, profile] = await Promise.all([
    getUserRedemptions(user.id),
    getProfileByClerkId(user.id),
  ]);

  const pointsBalance = profile?.points_balance || 0;

  return (
    <Shell>
      <div className="container py-10 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <History className="h-3.5 w-3.5" />
              <span>سجل المكافآت والاستبدال</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              سجل المكافآت والقسائم
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تتبع جميع عمليات السحب النقدي، والأشجار المغروسة، وتبرعات 57357، وقسائم الشراء السابقة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/rewards">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-xs font-bold">
                <ShoppingBag className="h-4 w-4" />
                استبدال مكافأة جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Balance Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">الرصيد المتاح حالياً</span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {formatPoints(pointsBalance)} <span className="text-xs text-muted-foreground">نقطة</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">إجمالي العمليات المستبدلة</span>
              <div className="text-xl font-bold font-mono text-foreground">
                {vouchers.length} <span className="text-xs text-muted-foreground">مكافأة</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">إجمالي النقاط المستبدلة</span>
              <div className="text-xl font-bold font-mono text-amber-600">
                {formatPoints(vouchers.reduce((acc, v) => acc + (v.points_spent || 0), 0))} <span className="text-xs text-muted-foreground">نقطة</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Vouchers & Redemptions List */}
        <VoucherList vouchers={vouchers} />
      </div>
    </Shell>
  );
}
