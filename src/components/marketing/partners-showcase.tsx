import React from "react";
import {
  Factory,
  Wallet,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PARTNER_GROUPS = [
  {
    category: "مصانع التدوير والصهر المعتمدة",
    icon: Factory,
    partners: [
      { name: "مصنع إيجي ريسايكل (6 أكتوبر)", sub: "مرخص من جهاز تنظيم إدارة المخلفات" },
      { name: "مجمع دلتا لصهر الإلكترونيات", sub: "استخلاص النحاس والمعادن الثمينة" },
      { name: "القاهرة للتدوير الأخضر", sub: "تفكيك آمن ومعالجة البوردات" },
    ],
  },
  {
    category: "المحافظ والقسائم ومنافذ الصرف",
    icon: Wallet,
    partners: [
      { name: "فودافون كاش (Vodafone Cash)", sub: "تحويل نقدي فوري" },
      { name: "شبكة المدفوعات اللحظية إنستاباي", sub: "تحويل بنكي مباشر" },
      { name: "نون مصر & كارفور", sub: "قسائم شراء وتسوق مخفضة" },
    ],
  },
  {
    category: "الجامعات والمراكز الذكية",
    icon: GraduationCap,
    partners: [
      { name: "جامعة القاهرة (Green Hub)", sub: "مراكز تسليم الحرم الجامعي" },
      { name: "القرية الذكية (Smart Village)", sub: "نقطة تجميع الشركات والمقرات" },
      { name: "جامعة الإسكندرية", sub: "مبادرة تدوير الحرم الساحلي" },
    ],
  },
  {
    category: "شركاء الأثر والمسؤولية المجتمعية",
    icon: HeartHandshake,
    partners: [
      { name: "مستشفى 57357 لعلاج سرطان الأطفال", sub: "تبرعات مالية موثقة" },
      { name: "مؤسسة شجرها لزراعة الأشجار", sub: "زراعة أشجار مثمرة بأسماء المتبرعين" },
      { name: "جمعية رسالة للأعمال الخيرية", sub: "إعادة تدوير مستدامة" },
    ],
  },
];

export function PartnersShowcase() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PARTNER_GROUPS.map((grp) => {
          const Icon = grp.icon;
          return (
            <Card key={grp.category} className="overflow-hidden border hover:border-emerald-200 transition-all">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{grp.category}</h4>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  شركاء رسميون
                </Badge>
              </div>

              <CardContent className="p-4 divide-y">
                {grp.partners.map((p) => (
                  <div key={p.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{p.name}</span>
                      <span className="text-[11px] text-muted-foreground">{p.sub}</span>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
