"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Smartphone,
  Laptop,
  BatteryCharging,
  Cable,
  Sparkles,
  Coins,
  Leaf,
  Factory,
  ArrowLeft,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils";

interface DevicePreset {
  id: string;
  name: string;
  weightKg: number;
  pointsPerUnit: number;
  co2SavedKg: number;
  copperGrams: number;
  goldMg: number;
}

const PRESETS: Record<string, DevicePreset> = {
  phone: {
    id: "phone",
    name: "هاتف ذكي",
    weightKg: 0.2,
    pointsPerUnit: 25,
    co2SavedKg: 1.8,
    copperGrams: 15,
    goldMg: 24,
  },
  laptop: {
    id: "laptop",
    name: "لابتوب / كمبيوتر",
    weightKg: 2.2,
    pointsPerUnit: 220,
    co2SavedKg: 14.5,
    copperGrams: 220,
    goldMg: 120,
  },
  battery: {
    id: "battery",
    name: "بطارية / باور بنك",
    weightKg: 0.35,
    pointsPerUnit: 35,
    co2SavedKg: 2.4,
    copperGrams: 30,
    goldMg: 0,
  },
  charger: {
    id: "charger",
    name: "شاحن / كابلات",
    weightKg: 0.15,
    pointsPerUnit: 15,
    co2SavedKg: 0.9,
    copperGrams: 45,
    goldMg: 5,
  },
};

export function ImpactCalculator() {
  const [counts, setCounts] = useState<Record<string, number>>({
    phone: 2,
    laptop: 1,
    battery: 1,
    charger: 3,
  });

  const updateCount = (key: string, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const totalPoints = Object.entries(counts).reduce(
    (acc, [k, qty]) => acc + (PRESETS[k]?.pointsPerUnit || 0) * qty,
    0
  );

  const totalWeightKg = Object.entries(counts).reduce(
    (acc, [k, qty]) => acc + (PRESETS[k]?.weightKg || 0) * qty,
    0
  );

  const totalCo2Kg = Object.entries(counts).reduce(
    (acc, [k, qty]) => acc + (PRESETS[k]?.co2SavedKg || 0) * qty,
    0
  );

  const totalCopperGrams = Object.entries(counts).reduce(
    (acc, [k, qty]) => acc + (PRESETS[k]?.copperGrams || 0) * qty,
    0
  );

  const totalGoldMg = Object.entries(counts).reduce(
    (acc, [k, qty]) => acc + (PRESETS[k]?.goldMg || 0) * qty,
    0
  );

  const treesEquivalent = (totalCo2Kg / 22).toFixed(1); // 1 mature tree absorbs ~22kg CO2/year

  return (
    <Card className="border-emerald-200/80 shadow-lg overflow-hidden bg-card">
      <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-white mb-2">
              <Calculator className="h-3.5 w-3.5" />
              <span>حاسبة العائد البيئي والمادي</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-white">
              احسب رصيد نقاطك وأثرك البيئي التقديري
            </CardTitle>
            <CardDescription className="text-emerald-100 text-xs sm:text-sm mt-1">
              اختر عدد الأجهزة القديمة الموجودة في منزلك لترى كمية النقاط والمعادن الثمينة التي ستنقذها.
            </CardDescription>
          </div>

          <div className="text-center sm:text-left bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <span className="text-[11px] text-emerald-100 block">إجمالي النقاط المتوقعة</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              +{formatPoints(totalPoints)}
            </span>
            <span className="text-[10px] text-emerald-200 block">نقطة مكافأة</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-8">
        {/* Device Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(PRESETS).map(([key, preset]) => {
            const qty = counts[key] || 0;
            return (
              <div
                key={key}
                className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between items-center text-center space-y-3"
              >
                <div className="space-y-1">
                  <span className="font-bold text-xs sm:text-sm text-foreground block">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    +{preset.pointsPerUnit} نقطة/جهاز
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCount(key, -1)}
                    className="h-7 w-7 rounded-lg border bg-card hover:bg-muted flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-6 font-bold font-mono text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateCount(key, 1)}
                    className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Environmental Impact Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
          <div className="space-y-1 text-center sm:text-start">
            <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              انبعاثات CO2 الممنوعة
            </span>
            <p className="text-xl font-extrabold text-foreground font-mono">
              {totalCo2Kg.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">كجم</span>
            </p>
          </div>

          <div className="space-y-1 text-center sm:text-start">
            <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Gem className="h-3.5 w-3.5 text-amber-600" />
              نحاس ومعدن ثمين
            </span>
            <p className="text-xl font-extrabold text-foreground font-mono">
              {totalCopperGrams} <span className="text-xs text-muted-foreground font-normal">جرام</span>
            </p>
          </div>

          <div className="space-y-1 text-center sm:text-start">
            <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              ذهب مستخلص من البوردات
            </span>
            <p className="text-xl font-extrabold text-amber-900 font-mono">
              {totalGoldMg} <span className="text-xs text-muted-foreground font-normal">مليجرام</span>
            </p>
          </div>

          <div className="space-y-1 text-center sm:text-start">
            <span className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Factory className="h-3.5 w-3.5 text-emerald-600" />
              وزن المخلفات المستنقذة
            </span>
            <p className="text-xl font-extrabold text-emerald-700 font-mono">
              {totalWeightKg.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">كجم</span>
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-muted-foreground">
            تأثيرك يعادل امتصاص كربون من <strong>{treesEquivalent} شجرة سنوياً</strong> في هواء مصر!
          </div>

          <Link href="/request">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 text-xs w-full sm:w-auto shadow-md">
              تسجيل طلب جمع بهذه الأجهزة
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
