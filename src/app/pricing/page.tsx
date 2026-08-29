import Link from "next/link";
import {
  Coins,
  Wallet,
  Scale,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Info,
  HelpCircle,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWasteCategories, getWasteItems } from "@/lib/supabase/catalog";
import { formatPoints } from "@/lib/utils";

export const metadata = {
  title: "قواعد النقاط والتسعير | منصة تدوير المخلفات الإلكترونية",
  description: "دليل شفاف يوضح أسعار النقاط لكل نوع وجهاز إلكتروني، ومعدلات تحويل النقاط إلى كاش وقسائم شراء.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [categories, items] = await Promise.all([
    getWasteCategories(),
    getWasteItems(),
  ]);

  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Coins className="h-3.5 w-3.5 text-emerald-600" />
            <span>نظام النقاط الشفاف والمكافآت</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            كيف نحتسب نقاط أجهزتك ونحوّلها إلى كاش؟
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            نعتمد تسعيراً عادلاً وشفافاً يعتمد على الوزن الفعلي ونوعية المعادن والمكونات الإلكترونية داخل كل جهاز.
          </p>
        </div>

        {/* Core Conversion Formula */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-start">
            <span className="text-xs font-bold text-emerald-100 bg-white/20 px-2.5 py-0.5 rounded-full">
              المعادلة الأساسية
            </span>
            <h3 className="text-xl font-bold">كل ١٠٠ نقطة = ١٠ جنيهات مصرية كاش</h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              تُحسب النقاط بضرب الوزن الفعلي (كجم) في معامل النقاط المخصص لكل فئة. عند استلام المندوب، يتم الوزن الدقيق وإيداع النقاط الرسمية في رصيدك فوراً.
            </p>
          </div>

          <Link href="/request">
            <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md">
              احسب نقاطك الآن
            </Button>
          </Link>
        </div>

        {/* Points Catalog Table / Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">دليل نقاط المخلفات بالكيلوجرام</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              قائمة بأبرز الأجهزة ومعدلات النقاط المعتمدة لكل كيلوجرام:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{item.name_ar}</h4>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.estimated_weight_kg ? `${item.estimated_weight_kg * 1000} جم/قطعة` : "بالكيلو"}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">النقاط للكيلو:</span>
                  <span className="font-bold font-mono text-emerald-700">
                    +{item.points_per_kg} نقطة/كجم
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payout Channels Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t">
          <Card className="p-5 space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              فودافون كاش & أورانج & وي
            </h4>
            <p className="text-xs text-muted-foreground">
              سحب ٥٠ ج.م مقابل ٥٠٠ نقطة، أو ١٠٠ ج.م مقابل ١٠٠٠ نقطة، أو ٢٠٠ ج.م مقابل ٢٠٠٠ نقطة تحويل مباشر للمحفظة.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-600" />
              شبكة إنستاباي (InstaPay)
            </h4>
            <p className="text-xs text-muted-foreground">
              تحويل بنكي لحظي لحسابك المصرفي أو بطاقة ميزة الوطنية خلال ساعات العمل الرسمية.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-600" />
              قسائم نون & تبرعات 57357
            </h4>
            <p className="text-xs text-muted-foreground">
              استبدال فوري بقسائم شراء نون مصر وكارفور، أو توجيه القيمة صدقة جارية لمستشفى علاج سرطان الأطفال.
            </p>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
