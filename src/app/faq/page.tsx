import Link from "next/link";
import {
  HelpCircle,
  ShieldCheck,
  Truck,
  Coins,
  FileCheck,
  Phone,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "الأسئلة الشائعة | منصة تدوير المخلفات الإلكترونية بمصر",
  description: "إجابات شاملة حول أمان مسح البيانات، مناطق التغطية، طرق سحب الكاش، وزراعة الأشجار والتبرعات.",
};

const FAQ_ITEMS = [
  {
    q: "كيف تضمنون أمان ومسح البيانات الشخصية على الهواتف واللابتوبات؟",
    a: "نتبع بروتوكولات صارمة للأمان السيبراني. تخضع وسائط التخزين والأقراص الصلبة (Hard Drives) والذواكر لعملية تدمير فيزيائي كامل (Physical Shredding & Degaussing) داخل المصانع المعتمدة، مما يستحيل معه استرجاع أي بيانات نهائياً.",
    icon: ShieldCheck,
  },
  {
    q: "هل خدمة الاستلام المنزلي مجانية بالكامل؟",
    a: "نعم، خدمة وصول المندوب لوزن واستلام الأجهزة من باب منزلك مجانية تماماً وبدون أي رسوم خفية في جميع المناطق المغطاة.",
    icon: Truck,
  },
  {
    q: "ما هي المحافظات والمناطق المتاح بها الاستلام حالياً؟",
    a: "نغطي حالياً محافظة القاهرة بالكامل، الجيزة (بما فيها 6 أكتوبر والشيخ زايد)، والإسكندرية، مع التوسع المستمر في محافظات الدلتا والقناة وقريباً في كافة أنحاء الجمهورية.",
    icon: Truck,
  },
  {
    q: "هل هناك حد أدنى لوزن أو عدد الأجهزة لطلب المندوب؟",
    a: "لا يوجد حد أدنى معقد؛ نرحب باستلام أي جهاز ذكي أو كمبيوتر أو كابلات قديمة. يمكنك أيضاً تسليم القطع الفردية الصغيرة في أقرب نقطة تجميع بالجامعات والمراكز التجارية.",
    icon: Sparkles,
  },
  {
    q: "كيف ومتى أستلم الكاش بعد استبدال النقاط؟",
    a: "بمجرد تقديم طلب سحب الكاش في صفحة المكافآت، يقوم فريق العمل بمراجعة رقم المحفظة (فودافون كاش أو إنستاباي) وإرسال المبلغ النقدي مباشرة خلال ساعات العمل الرسمية مع إشعار فوري.",
    icon: Coins,
  },
  {
    q: "كيف أحصل على شهادة زراعة الشجرة أو إيصال تبرع 57357؟",
    a: "فور استبدال النقاط بشجرة أو تبرع، تظهر لك الشهادة الرسمية الرقمية بكود موثق واسمك في صفحة (سجل المكافآت)، كما يتم زراعة الشجرة في أقرب دورة تشجير مع مؤسسة شجرها وتوجيه التبرع للمستشفى.",
    icon: FileCheck,
  },
  {
    q: "هل تقدمون خدمات تدوير مخصصة للشركات والمصانع؟",
    a: "نعم، نوفر عقوداً خاصة للشركات والمؤسسات تشمل إصدار شهادات تدوير معتمدة (Green Certificates) لتقارير الاستدامة والحوكمة (ESG) ومحاضر إتلاف بيانات رسمية.",
    icon: ShieldCheck,
  },
];

export default function FAQPage() {
  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>مركز المساعدة والمعلومات</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            الأسئلة الشائعة والإجابات
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            كل ما تحتاج لمعرفته حول آلية العمل، الأمان، تحويل النقاط، ومسار الشحنات.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 hover:border-emerald-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                      {item.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="p-8 rounded-3xl bg-muted/40 border text-center space-y-4">
          <h3 className="font-bold text-lg text-foreground">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            فريق خدمة العملاء متاح للإجابة على كافة استفساراتك وتقديم المساعدة في أي وقت.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/contact">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2">
                تواصل مع الدعم
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
