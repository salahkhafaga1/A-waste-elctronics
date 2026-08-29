import Link from "next/link";
import {
  Leaf,
  Trees,
  Gem,
  Factory,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Award,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactCalculator } from "@/components/marketing/impact-calculator";

export const metadata = {
  title: "الأثر البيئي والاستدامة | منصة تدوير المخلفات الإلكترونية",
  description: "اطلع على الأثر البيئي الحقيقي لإعادة التدوير: منع انبعاثات الكربون، استخلاص المعادن النفيسة، وزراعة آلاف الأشجار في مصر.",
};

export default function ImpactPage() {
  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span>تقرير الأثر البيئي المباشر</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            كل جهاز تدوره ينقذ هواء وأرض مصر من السموم
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            المخلفات الإلكترونية ليست مجرد خردة؛ إعادة تدويرها بطرق علمية معتمدة يحمي المياه الجوفية ويسترجع موارد ثمينة لا تعوض.
          </p>
        </div>

        {/* Environmental Key Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-emerald-200/80 bg-emerald-50/20">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">تقليل البصمة الكربونية</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              إعادة تدوير طن واحد من اللابتوبات يوفر ما يعادل <strong>١٤ طناً من انبعاثات ثاني أكسيد الكربون</strong> مقارنة بالتعدين واستخراج المعادن الجديدة.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-amber-200/80 bg-amber-50/20">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Gem className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">استخلاص الذهب والنحاس</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تحتوي طن البوردات الإلكترونية على كمية ذهب ونحاس تعادل <strong>٤٠ إلى ٨٠٠ ضعف</strong> ما تنتجه خامات مناجم الذهب الطبيعية.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-rose-200/80 bg-rose-50/20">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">منع التسمم بالرصاص والزئبق</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تفكيك الشاشات والبطاريات في مصانع معتمدة يمنع تسرب المعادن الثقيلة الخطرة إلى النيل والتربة الزراعية المحيطة.
            </p>
          </Card>
        </div>

        {/* Tree Planting Pillar */}
        <Card className="border-emerald-300 bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-start">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full text-white">
                <Trees className="h-4 w-4" />
                <span>مبادرة مصر الخضراء</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                أكثر من ١,٨٥٠ شجرة زيتون ومثمرة زُرعت بفضلكم
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                بالتعاون مع مؤسسة &quot;شجرها&quot; والمدارس الحكومية، نتيح لكل مستخدم استبدال نقاطه برعاية شجرة موثقة بشهادة بيئية رسمية تسجل موقع الشجرة على الخريطة.
              </p>
            </div>

            <Link href="/rewards">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md">
                استبدل نقاطك بشجرة
              </Button>
            </Link>
          </div>
        </Card>

        {/* Interactive Impact Calculator */}
        <div className="space-y-4 pt-4">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl font-extrabold">احسب أثر أجهزتك الشخصية</h2>
            <p className="text-xs text-muted-foreground mt-1">
              اختر الأجهزة المتوفرة لديك لتشاهد المعادل المباشر لإنقاذ الكربون واستخلاص الذهب.
            </p>
          </div>
          <ImpactCalculator />
        </div>
      </div>
    </Shell>
  );
}
