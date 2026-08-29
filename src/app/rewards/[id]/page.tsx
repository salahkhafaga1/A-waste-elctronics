import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Gift,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRewardById } from "@/lib/supabase/rewards";
import { getProfileByClerkId } from "@/lib/supabase/profiles";
import { REWARD_CATEGORY_LABELS_AR } from "@/constants/rewards";
import { formatPoints } from "@/lib/utils";
import { RewardGrid } from "@/components/rewards/reward-grid";

export const dynamic = "force-dynamic";

interface RewardDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RewardDetailPage({ params }: RewardDetailPageProps) {
  const user = await currentUser();
  const reward = await getRewardById(params.id);

  if (!reward) {
    notFound();
  }

  let userPointsBalance = 0;
  if (user) {
    const profile = await getProfileByClerkId(user.id);
    userPointsBalance = profile?.points_balance || 0;
  }

  const categoryInfo = REWARD_CATEGORY_LABELS_AR[reward.category] || {
    label: reward.category,
    description: "",
  };

  return (
    <Shell>
      <div className="container py-10 max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Gift className="h-3.5 w-3.5" />
              <span>تفاصيل المكافأة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {reward.title_ar}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              الجهة / الشريك: <strong className="text-foreground">{reward.partner_name}</strong>
            </p>
          </div>

          <Link href="/rewards">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              العودة للمتجر
            </Button>
          </Link>
        </div>

        {/* Reward Hero & Redemption Component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{categoryInfo.label}</Badge>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {formatPoints(reward.points_cost)} نقطة
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">{reward.title_ar}</CardTitle>
                <CardDescription className="text-xs">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    عن المكافأة وطريقة الاستفادة
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {reward.category === "cash"
                      ? "يتم تحويل المبلغ النقدي مباشرة إلى محفظة فودافون كاش أو حساب إنستاباي بعد مراجعة الطلب."
                      : reward.category === "tree"
                      ? "يتم غرس شجرة مثمرة باسمك أو بإهداء لمن تحب، مع توثيق شهادة غرس بيئية رقمية."
                      : reward.category === "donation"
                      ? "يتم توجيه قيمة التبرع مباشرة لدعم علاج أطفال مستشفى 57357 مع إصدار إيصال رسمي."
                      : `يتم استبدال هذه القسيمة واستخدام الرمز المخصص مباشرة عند إتمام الطلب أو الشحن في منصة ${reward.partner_name}.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg border bg-card">
                    <span className="text-muted-foreground text-[11px]">القيمة التقديرية</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">{reward.monetary_value} جنيه مصري</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <span className="text-muted-foreground text-[11px]">فترة الصلاحية</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">{reward.expiry_days} يوماً من الاستبدال</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  شروط وأحكام الاستبدال
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>تتم مراجعة العمليات وخصم النقاط بشكل آمن وفوري من سجل المعاملات.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>تطبق الشروط والأحكام الخاصة بالجهة أو الشريك {reward.partner_name}.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>يتم حفظ جميع عملياتك في صفحة &quot;سجل المكافآت&quot; للرجوع إليها ومتابعة حالتها في أي وقت.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Widget using RewardGrid */}
          <div>
            <RewardGrid
              rewards={[reward]}
              userPointsBalance={userPointsBalance}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}
