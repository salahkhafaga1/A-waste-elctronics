import Link from "next/link";
import {
  Camera,
  Truck,
  Scale,
  Gift,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveWorkflow } from "@/components/marketing/interactive-workflow";

export const metadata = {
  title: "كيف تعمل المنصة | دليل تدوير المخلفات الإلكترونية",
  description: "دليل تفصيلي لخطوات التخلص من المخلفات الإلكترونية بدءاً من التصوير الذكي، والاستلام من المنزل، وحتى تحويل النقاط إلى كاش ومكافآت.",
};

export default function HowItWorksPage() {
  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>دليل الاستخدام الكامل</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            دليلك الشامل لتدوير أجهزتك خطوة بخطوة
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            صممنا المنصة لتكون أسهل وأسرع وسيلة للتخلص الآمن من الأجهزة التالفة والحصول على مكافآت فورية موثقة.
          </p>
        </div>

        {/* Interactive Stepper */}
        <InteractiveWorkflow />

        {/* For Individuals vs For Businesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <Card className="p-6 space-y-4 border-emerald-200 bg-emerald-50/20">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-800">للأفراد والمنازل</span>
              <h3 className="text-lg font-bold text-foreground">استلام منزلي مريح ومجاني</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>لا يوجد حد أدنى معقد؛ نقبل حتى الشواحن والكابلات القديمة.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>تحديد مواعيد الزيارة بدقة مع تتبع لحظي لهاتف المندوب.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>تحويل الكاش على فودافون كاش وإنستاباي في نفس اليوم.</span>
              </li>
            </ul>
            <Link href="/request">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold mt-2">
                تسجيل طلب منزلي الآن
              </Button>
            </Link>
          </Card>

          <Card className="p-6 space-y-4 border-amber-200 bg-amber-50/20">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800">للشركات والمؤسسات والجامعات</span>
              <h3 className="text-lg font-bold text-foreground">شهادات تدوير معتمدة وإتلاف بيانات آمن</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>إصدار شهادات بيئية رسمية بالكميات وأوزان التدوير للتقارير البيئية.</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>محاضر إتلاف فيزيائي معتمدة للهارد ديسك ووسائط التخزين لسرية البيانات.</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                <span>أسطول نقل مخصص للأوزان الكبيرة وحاويات الأجهزة الضخمة.</span>
              </li>
            </ul>
            <Link href="/contact">
              <Button variant="outline" className="w-full border-amber-300 text-amber-900 hover:bg-amber-100/50 text-xs font-bold mt-2">
                طلب شراكة أو عرض أسعار للشركات
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
