"use server";

import { analyzeWasteImage } from "@/lib/ai/estimator";
import { getWasteCategories, getWasteItems } from "@/lib/supabase/catalog";
import type { WasteAnalysisResponse } from "@/lib/ai/types";

export async function analyzeWasteImageAction(payload: {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
}): Promise<WasteAnalysisResponse> {
  try {
    if (!payload.imageBase64) {
      return { success: false, error: "لم يتم استلام أي بيانات للصورة." };
    }

    const [categories, items] = await Promise.all([
      getWasteCategories(),
      getWasteItems(),
    ]);

    const estimate = await analyzeWasteImage(payload, categories, items);

    return {
      success: true,
      estimate,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "تعذر إتمام التعرف الذكي على الصورة.",
    };
  }
}
