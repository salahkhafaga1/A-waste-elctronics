import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Coins,
  Truck,
  Building2,
  Camera,
  Gift,
  Trees,
  Heart,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shell } from "@/components/layout/shell";
import { ImpactCalculator } from "@/components/marketing/impact-calculator";
import { InteractiveWorkflow } from "@/components/marketing/interactive-workflow";
import { PartnersShowcase } from "@/components/marketing/partners-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { StatsCounter } from "@/components/marketing/stats-counter";

export default function HomePage() {
  return (
    <Shell>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-emerald-50/60 via-background to-background">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 mb-6 shadow-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>المنصة الأولى المعتمدة لتدوير المخلفات الإلكترونية في مصر</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl text-foreground leading-[1.2]">
            حوّل أجهزتك الإلكترونية القديمة إلى{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
              كاش فوري ومكافآت قيّمة
            </span>{" "}
            واحمِ بيئة مصر
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            تخلّص بأمان من الهواتف، اللابتوبات، الكابلات، والبطاريات التالفة من باب منزلك مع فحص ذكي بالذكاء الاصطناعي وإيداع نقاط فورية قابلة للسحب النقدي أو زراعة أشجار والتبرع لمستشفى 57357.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/request">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg h-12 px-6 text-sm">
                <Camera className="h-4 w-4" />
                طلب جمع مع المسح الذكي (AI)
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>

            <Link href="/collection-points">
              <Button variant="outline" size="lg" className="h-12 px-5 text-sm font-semibold">
                فروع ونقاط التجميع
              </Button>
            </Link>
          </div>

          {/* Live Platform Stats */}
          <div className="mt-16 w-full max-w-5xl">
            <StatsCounter />
          </div>
        </div>
      </section>

      {/* 2. Interactive Impact Calculator Section */}
      <section className="py-16 md:py-20 bg-muted/20 border-t">
        <div className="container max-w-5xl space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold">حاسبة العائد والأثر البيئي</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              جرّب تحديد كمية الأجهزة المهملة لديك لمعرفة ما ستكسبه من نقاط وتأثيرك الإيجابي في إنقاذ هواء ومعادن مصر.
            </p>
          </div>

          <ImpactCalculator />
        </div>
      </section>

      {/* 3. Interactive 4-Step Workflow */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
              <Zap className="h-3.5 w-3.5" />
              <span>خطوات بسيطة وسريعة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">كيف تعمل دورة التدوير المتكاملة؟</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              من لحظة تصوير جهازك بالهاتف وحتى استلام المكافأة النقدية أو شهادة زراعة الشجرة.
            </p>
          </div>

          <InteractiveWorkflow />
        </div>
      </section>

      {/* 4. Three Major Reward Pillars */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-muted/20 via-background to-muted/20 border-t">
        <div className="container max-w-5xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold">مكافآت تلبي كافة اهتماماتك</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              نقدم لك ثلاثة مسارات رئيسية لاستبدال نقاطك التقديرية بأمان وسرعة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">سحب كاش فوري</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  تحويل مبالغ نقدية حقيقية مباشرة إلى محفظة فودافون كاش أو حسابك البنكي عبر شبكة إنستاباي في نفس اليوم.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-800">٥٠ / ١٠٠ / ٢٠٠ ج.م</span>
                <Link href="/rewards">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-amber-900">
                    استكشف العروض
                    <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Trees className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ازرع شجرة باسمك</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  حوّل نقاطك إلى أشجار زيتون حقيقية تُزرع في المدارس والمحافظات المصرية مع شهادة بيئية موثقة باسمك أو اسم من تحب.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800">شهادة رقمية معتمدة</span>
                <Link href="/rewards">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-emerald-900">
                    عرض الشهادات
                    <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="border-rose-200 bg-gradient-to-br from-rose-500/10 via-card to-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">تبرع لمستشفى 57357</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  وجّه قيمة مخلفاتك الإلكترونية لدعم علاج أطفال مستشفى سرطان الأطفال 57357 مع إيصال رسمي فوري بالتبرع.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-800">صدقة جارية بيئية</span>
                <Link href="/rewards">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-rose-900">
                    تفاصيل التبرع
                    <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Partners Showcase */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold">شبكة الشركاء المعتمدين بمصر</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              نتعاون مع كبرى مصانع الصهر المرخصة بيئياً والجامعات والمؤسسات الخيرية لضمان أعلى معايير الاستدامة.
            </p>
          </div>

          <PartnersShowcase />
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-16 md:py-20 bg-muted/20 border-t">
        <div className="container max-w-5xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold">آراء وتجارب المستخدمين</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              تعرف على تجارب مواطنين وشركات أعادوا تدوير أجهزتهم معنا.
            </p>
          </div>

          <Testimonials />
        </div>
      </section>

      {/* 7. Bottom Final Call To Action */}
      <section className="py-16 md:py-20 bg-emerald-700 text-white relative overflow-hidden">
        <div className="container max-w-4xl text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            جاهز لتحويل خردتك الإلكترونية إلى مكافآت؟
          </h2>
          <p className="text-xs sm:text-base text-emerald-100 max-w-xl mx-auto">
            سجّل طلبك الآن مجاناً وسيتولى مندوبنا الوصول لباب بيتك ووزن الأجهزة وإيداع نقاطك فوراً.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/request">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold h-12 px-8 text-sm shadow-lg">
                بدء طلب الجمع الآن
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10 h-12 text-sm">
                الأسئلة الشائعة
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
