import Link from "next/link";
import {
  Recycle,
  ShieldCheck,
  Target,
  Eye,
  Heart,
  Trees,
  Factory,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "من نحن ورسالتنا | منصة تدوير المخلفات الإلكترونية بمصر",
  description: "المنصة الرقمية الأولى في مصر لإدارة وإعادة تدوير الأجهزة والمخلفات الإلكترونية وفق معايير جهاز تنظيم إدارة المخلفات.",
};

export default function AboutPage() {
  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Recycle className="h-3.5 w-3.5" />
            <span>رؤيتنا نحو مصر خضراء ومستدامة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            نبني أول منظومة متكاملة لتدوير المخلفات الإلكترونية في مصر
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            تأسست المنصة بهدف حل التحدي البيئي المتزايد للنفايات الإلكترونية، وتحويل الأجهزة القديمة والخردة المهملة في المنازل والشركات إلى موارد ثمينة وحوافز نقدية وبيئية ملموسة.
          </p>
        </div>

        {/* The Problem & The Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-rose-200/80 bg-rose-50/20 p-6 space-y-3">
            <h3 className="font-bold text-base text-rose-950 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">!</span>
              تحدي المخلفات الإلكترونية في مصر
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تنتج مصر ما يزيد عن <strong>١٠٠ ألف طن سنوياً</strong> من المخلفات الإلكترونية والكهربائية. يؤدي التخلص العشوائي منها في القمامة إلى تسرب معادن سامة كالرصاص والزئبق للمياه الجوفية والتربة، بالإضافة إلى إهدار آلاف الأطنان من النحاس والذهب والمعادن النادرة.
            </p>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/20 p-6 space-y-3">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              الحل الذكي والمستدام عبر المنصة
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              نربط المواطن مباشرة بمصانع التدوير المرخصة عبر أسطول نقل مجاني ومسح ذكي بالذكاء الاصطناعي، مع تقديم نظام مكافآت مرن يتيح سحب كاش فودافون كاش وإنستاباي، أو زراعة أشجار حقيقية، أو التبرع لمستشفى 57357.
            </p>
          </Card>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-base text-foreground">رسالتنا</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تمكين كل منزل ومؤسسة في مصر من التخلص المسؤول من أجهزتهم الإلكترونية بضغطة زر واحدة دون أي تكلفة أو مجهود.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-base text-foreground">رؤيتنا</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تحقيق نسبة تدوير تتجاوز ٨٠٪ من النفايات الإلكترونية المنزلية بحلول عام ٢٠٣٠ دعماً لأهداف رؤية مصر ٢٠٣٠ للتنمية المستدامة.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-base text-foreground">قيمنا ومعاييرنا</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              الشفافية المطلقة في الوزن واحتساب النقاط، والتدمير الآمن المعتمد للبيانات، والشراكة مع المصانع المعتمدة بيئياً فقط.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-muted/40 border text-center space-y-4">
          <h3 className="font-bold text-xl text-foreground">كن جزءاً من التغيير الأخضر اليوم</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            سجّل جهازك القديم الآن وسيتولى مندوبنا الوصول إليك لوزنه وإيداع مكافأتك فوراً.
          </p>
          <Link href="/request">
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 text-xs h-10 px-6">
              طلب جمع مخلفات
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
