import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Gift,
  Coins,
  Ticket,
  Sparkles,
  PlusCircle,
  History,
  Wallet,
  Trees,
  HeartHandshake,
  ShoppingBag,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RewardGrid } from "@/components/rewards/reward-grid";
import { getActiveRewards } from "@/lib/supabase/rewards";
import { getProfileByClerkId } from "@/lib/supabase/profiles";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RewardsCatalogPage() {
  const user = await currentUser();

  let userPointsBalance = 0;
  if (user) {
    const profile = await getProfileByClerkId(user.id);
    userPointsBalance = profile?.points_balance || 0;
  }

  const rewards = await getActiveRewards();

  return (
    <Shell>
      <div className="container py-10 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Gift className="h-3.5 w-3.5" />
              <span>مكافآت وإعادة التدوير</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              متجر المكافآت والاستبدال
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              حوّل نقاطك إلى كاش فوري، أو زراعة شجرة بيئية، أو تبرع لمستشفى 57357، أو قسائم تسوق.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/rewards/history">
                <Button
                  variant="outline"
                  className="gap-2 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <History className="h-4 w-4" />
                  سجل مكافآتي
                </Button>
              </Link>
            ) : (
              <Link href="/login?redirect_url=/rewards">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs">
                  تسجيل الدخول للاستبدال
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 3 Core Reward Pillar Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200/80 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-950">سحب نقدي (كاش)</h3>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                تحويل مباشر لمحفظة فودافون كاش أو إنستاباي.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Trees className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-950">زراعة شجرة بيئية</h3>
              <p className="text-xs text-emerald-900/80 mt-0.5 leading-relaxed">
                غرس أشجار مثمرة بمصر مع شهادة باسمك.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-950">تبرع لمستشفى 57357</h3>
              <p className="text-xs text-rose-900/80 mt-0.5 leading-relaxed">
                دعم علاج ورعاية أطفال سرطان الأورام.
              </p>
            </div>
          </div>
        </div>

        {/* User Balance Banner (if logged in) */}
        {user && (
          <Card className="border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-card to-card shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">رصيدك المتاح للاستبدال</span>
                  <div className="text-2xl font-black text-emerald-600">
                    {formatPoints(userPointsBalance)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">نقطة</span>
                  </div>
                </div>
              </div>

              <Link href="/request">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  جمع المزيد من النقاط
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Rewards Catalog Component */}
        <RewardGrid
          rewards={rewards}
          userPointsBalance={userPointsBalance}
          isLoggedIn={!!user}
        />
      </div>
    </Shell>
  );
}
