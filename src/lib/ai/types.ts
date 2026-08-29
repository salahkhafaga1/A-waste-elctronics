export interface WasteAIEstimate {
  detected_category: string;
  detected_category_ar: string;
  detected_item: string;
  detected_item_ar: string;
  category_id?: string;
  waste_item_id?: string;
  confidence: number; // 0 to 100
  estimated_weight_kg: number;
  estimated_points: number;
  base_price_egp?: number;
  analysis_notes?: string;
  source: "ai_vision" | "fallback_heuristic";
}

export interface WasteAnalysisRequest {
  imageBase64: string;
  mimeType: string;
  fileName?: string;
}

export interface WasteAnalysisResponse {
  success: boolean;
  estimate?: WasteAIEstimate;
  error?: string;
}
