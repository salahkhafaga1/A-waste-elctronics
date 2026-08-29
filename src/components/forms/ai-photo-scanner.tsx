"use client";

import React, { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scale,
  Coins,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeWasteImageAction } from "@/app/actions/ai";
import { formatPoints } from "@/lib/utils";
import { compressImageClient } from "@/lib/image-utils";
import type { WasteAIEstimate } from "@/lib/ai/types";

interface AIPhotoScannerProps {
  onItemDetected: (estimate: WasteAIEstimate, imagePreviewUrl: string) => void;
}

export function AIPhotoScanner({ onItemDetected }: AIPhotoScannerProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<WasteAIEstimate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 15 ميجابايت.");
      return;
    }

    try {
      // Compress image client-side to ensure small payload size (< 500KB)
      const base64Data = await compressImageClient(file, 1000, 0.75);
      setPreviewUrl(base64Data);
      setEstimate(null);
      setErrorMsg(null);

      // Trigger AI Analysis
      startTransition(async () => {
        const res = await analyzeWasteImageAction({
          imageBase64: base64Data,
          mimeType: "image/jpeg",
          fileName: file.name,
        });

        if (!res.success || !res.estimate) {
          setErrorMsg(res.error || "تعذر التعرف على الجهاز من الصورة.");
          toast.error("فشل التعرف الذكي", { description: res.error });
          return;
        }

        setEstimate(res.estimate);
        toast.success("تم التعرف على الجهاز بنجاح!");
      });
    } catch (err: any) {
      toast.error("تعذر قراءة ملف الصورة.");
    }
  };

  const handleApplyEstimate = () => {
    if (!estimate || !previewUrl) return;
    onItemDetected(estimate, previewUrl);
    toast.success(`تمت إضافة (${estimate.detected_item_ar}) إلى قائمة الأجهزة بالطلب.`);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setEstimate(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-amber-300 bg-gradient-to-br from-amber-500/10 via-card to-card overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b bg-amber-50/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-950">
            <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
            الماسح الذكي بالذكاء الاصطناعي (AI Scanner)
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-amber-100/60 text-amber-900 border-amber-300">
            تقدير فوري للوزن والنقاط
          </Badge>
        </div>
        <CardDescription className="text-xs text-amber-900/80">
          صوّر جهازك الإلكتروني أو ارفع صورته، وسيتعرف الذكاء الاصطناعي على نوعه وتقدير وزنه ونقاطه تلقائياً.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl p-6 text-center hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">التقط صورة أو اختر ملف من جهازك</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                يدعم صيغ JPG و PNG و WebP حتى 10 ميجابايت
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Photo Preview & Scanning Animation */}
              <div className="relative h-44 rounded-xl overflow-hidden border bg-muted flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="E-Waste Preview"
                  className="h-full w-full object-cover"
                />

                {isPending && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                    <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                    <span className="font-bold text-xs">جاري فحص الجهاز وتحليل البصمة الإلكترونية...</span>
                  </div>
                )}
              </div>

              {/* Estimate Details */}
              {estimate && !isPending && (
                <div className="space-y-3 p-3.5 rounded-xl bg-card border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {estimate.detected_item_ar}
                    </span>
                    <Badge variant="default" className="text-[10px] bg-emerald-600">
                      دقة {estimate.confidence}%
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    التصنيف: <strong>{estimate.detected_category_ar}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-muted/40 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Scale className="h-3 w-3 text-emerald-600" />
                        الوزن التقديري:
                      </span>
                      <p className="font-bold text-foreground font-mono">{estimate.estimated_weight_kg} كجم</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3 text-emerald-600" />
                        النقاط التقديرية:
                      </span>
                      <p className="font-bold text-emerald-700 font-mono">+{formatPoints(estimate.estimated_points)} نقطة</p>
                    </div>
                  </div>

                  {estimate.analysis_notes && (
                    <p className="text-[10px] text-muted-foreground italic">
                      {estimate.analysis_notes}
                    </p>
                  )}
                </div>
              )}

              {errorMsg && !isPending && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4" />
                    تعذر التعرف التلقائي
                  </div>
                  <p className="text-[11px]">{errorMsg}</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span>القيم تقديرية وسيتم الوزن الرسمي عند استلام المندوب.</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs h-8 gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  صورة أخرى
                </Button>

                {estimate && !isPending && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyEstimate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-8"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    إضافة الجهاز للطلب
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
