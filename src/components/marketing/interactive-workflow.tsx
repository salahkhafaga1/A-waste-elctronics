"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Camera,
  Truck,
  Scale,
  Gift,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "صوّر أو اختر أجهزتك",
    icon: Camera,
    shortDesc: "مسح فوري بالذكاء الاصطناعي",
    detailDesc:
      "التقط صورة لأجهزتك الإلكترونية القديمة أو اخترها من دليل المخلفات، ليقوم الذكاء الاصطناعي بتقدير الوزن والنقاط المتوقعة في ثوانٍ معدودة.",
    badgeText: "AI Smart Scanner",
  },
  {
    step: "02",
    title: "مندوب أو نقطة تجميع",
    icon: Truck,
    shortDesc: "استلام من باب المنزل مجاناً",
    detailDesc:
      "حدد موعد الزيارة المفضل ليصلك مندوب أسطول الشحن الأخضر مباشرة لباب بيتك، أو قم بتسليم الأجهزة بنفسك في أقرب فرع بالجامعات والمراكز التجارية.",
    badgeText: "تغطية القاهرة والجيزة والإسكندرية",
  },
  {
    step: "03",
    title: "فحص رسمي وإيداع النقاط",
    icon: Scale,
    shortDesc: "شفافية مطلقة في الوزن",
    detailDesc:
      "يقوم المندوب بوزن الأجهزة بميزان إلكتروني دقيق معتمد، ويتم فوراً اعتماد الوزن وإيداع نقاط المكافآت الرسمية في محفظتك الإلكترونية.",
    badgeText: "إيداع نقاط فوري",
  },
  {
    step: "04",
    title: "اختر مكافأتك المفضلة",
    icon: Gift,
    shortDesc: "كاش، زراعة شجرة، أو تبرع لـ 57357",
    detailDesc:
      "حوّل نقاطك إلى كاش فوري على فودافون كاش وإنستاباي، أو ازرع شجرة حقيقية باسمك موثقة بشهادة بيئية، أو تبرع لعلاج أطفال مستشفى 57357 وقسائم نون.",
    badgeText: "سحب كاش معتمد",
  },
];

export function InteractiveWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="space-y-8">
      {/* Workflow Tabs / Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                isActive
                  ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-card hover:bg-muted/30 border-muted text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono font-bold ${isActive ? "text-emerald-700" : "text-muted-foreground"}`}>
                  خطوة {step.step}
                </span>
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <h3 className={`font-bold text-sm leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                {step.shortDesc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Step Feature Box */}
      <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-card to-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-start">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3 text-emerald-700" />
              <span>{WORKFLOW_STEPS[activeStep].badgeText}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
              {WORKFLOW_STEPS[activeStep].title}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {WORKFLOW_STEPS[activeStep].detailDesc}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link href="/request" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 text-xs h-10 shadow-sm">
                ابدأ الطلب الآن
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-xs h-10">
                الدليل التفصيلي
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
