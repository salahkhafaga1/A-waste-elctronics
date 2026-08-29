import React from "react";
import { Star, Quote, CheckCircle2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TESTIMONIALS = [
  {
    name: "م. أحمد حسان",
    role: "مهندس برمجيات — التجمع الخامس",
    avatar: "AH",
    quote:
      "كان عندي كرتونة مليانة لابتوبات وشواحن قديمة بقالها ٥ سنين. استخدمت الماسح بالذكاء الاصطناعي وحدد النقاط بدقة، المندوب وصل تاني يوم وحوّلت النقاط لكاش فودافون في نفس الساعة!",
    rating: 5,
    rewardType: "سحب كاش فودافون",
  },
  {
    name: "سارة عبد الرحمن",
    role: "طالبة بجامعة القاهرة — الجيزة",
    avatar: "SA",
    quote:
      "سلّمت موبايلات قديمة في نقطة تجميع كلية الهندسة واستبدلت النقاط بزراعة شجرة زيتون باسمي. استلمت شهادة بيئية موثقة برقم الكود، تجربة مبهجة وتخدم البيئة بجد.",
    rating: 5,
    rewardType: "شجرة باسمي",
  },
  {
    name: "د. طارق المنشاوي",
    role: "مدير تقنية معلومات — شركة استشارات",
    avatar: "TM",
    quote:
      "تخلصنا من ٤٠ جهاز كمبيوتر وشاشات قديمة بالشركة مع شهادة تدوير رسمية لضمان أمان مسح البيانات. كل الموظفين تبرعوا بقيمة النقاط لمستشفى 57357. منصة ممتازة واحترافية.",
    rating: 5,
    rewardType: "تبرع 57357",
  },
];

export function Testimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((item) => (
        <Card key={item.name} className="p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                {item.rewardType}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
              &quot;{item.quote}&quot;
            </p>
          </div>

          <div className="pt-4 mt-4 border-t flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {item.avatar}
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground">{item.name}</h4>
              <span className="text-[11px] text-muted-foreground block">{item.role}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
