"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Smartphone,
  Cable,
  BatteryCharging,
  Headphones,
  Cpu,
  Plus,
  Minus,
  Trash2,
  UploadCloud,
  MapPin,
  Coins,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCollectionRequestServerAction } from "@/app/actions/request";
import { EGYPTIAN_GOVERNORATES, ITEM_CONDITION_LABELS_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";
import { compressImageClient } from "@/lib/image-utils";
import { AIPhotoScanner } from "@/components/forms/ai-photo-scanner";
import type { WasteAIEstimate } from "@/lib/ai/types";
import type { WasteCategory, WasteItem, ItemCondition } from "@/types/database";

const ICON_MAP: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="h-5 w-5" />,
  Cable: <Cable className="h-5 w-5" />,
  BatteryCharging: <BatteryCharging className="h-5 w-5" />,
  Headphones: <Headphones className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
};

interface WizardItem {
  waste_item_id: string;
  item_name: string;
  category_name: string;
  points_per_kg: number;
  unit_weight_kg: number;
  quantity: number;
  condition: ItemCondition;
  image_preview?: string | null;
}

interface RequestWizardProps {
  categories: WasteCategory[];
  items: WasteItem[];
  defaultPhone?: string;
  defaultFullName?: string;
}

export function RequestWizard({
  categories,
  items,
  defaultPhone = "",
  defaultFullName = "",
}: RequestWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");
  const [selectedItems, setSelectedItems] = useState<WizardItem[]>([]);

  // Location & Contact Form State
  const [governorate, setGovernorate] = useState<string>("القاهرة");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>(defaultPhone);
  const [notes, setNotes] = useState<string>("");

  // Uploaded photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Filter items for active category
  const activeCategoryItems = items.filter((item) => item.category_id === selectedCategory);

  // Add / Increment Item
  const handleAddItem = (item: WasteItem) => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.waste_item_id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      const category = categories.find((c) => c.id === item.category_id);
      return [
        ...prev,
        {
          waste_item_id: item.id,
          item_name: item.name_ar,
          category_name: category ? category.name_ar : "",
          points_per_kg: item.points_per_kg,
          unit_weight_kg: item.estimated_weight_kg,
          quantity: 1,
          condition: "broken",
        },
      ];
    });
  };

  // Handle AI Scanner detected item
  const handleAIDetectedItem = (estimate: WasteAIEstimate, imagePreviewUrl: string) => {
    const matchingItem = items.find(
      (i) =>
        i.id === estimate.waste_item_id ||
        i.name_ar.includes(estimate.detected_item_ar) ||
        i.name.toLowerCase().includes(estimate.detected_item.toLowerCase())
    );

    if (matchingItem) {
      setSelectedItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.waste_item_id === matchingItem.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += 1;
          updated[existingIndex].image_preview = imagePreviewUrl;
          return updated;
        }
        const category = categories.find((c) => c.id === matchingItem.category_id);
        return [
          ...prev,
          {
            waste_item_id: matchingItem.id,
            item_name: matchingItem.name_ar,
            category_name: category ? category.name_ar : "",
            points_per_kg: matchingItem.points_per_kg,
            unit_weight_kg: estimate.estimated_weight_kg || matchingItem.estimated_weight_kg,
            quantity: 1,
            condition: "broken",
            image_preview: imagePreviewUrl,
          },
        ];
      });
    } else {
      const cat = categories.find((c) => c.id === estimate.category_id) || categories[0];
      setSelectedItems((prev) => [
        ...prev,
        {
          waste_item_id: estimate.waste_item_id || `custom-ai-${Date.now()}`,
          item_name: estimate.detected_item_ar,
          category_name: cat ? cat.name_ar : estimate.detected_category_ar,
          points_per_kg: 100,
          unit_weight_kg: estimate.estimated_weight_kg || 0.5,
          quantity: 1,
          condition: "broken",
          image_preview: imagePreviewUrl,
        },
      ]);
    }

    if (!photoPreview) {
      setPhotoPreview(imagePreviewUrl);
    }
  };

  // Decrement Item
  const handleDecrementItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.waste_item_id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.waste_item_id !== itemId);
      }
      return prev.map((i) =>
        i.waste_item_id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.waste_item_id !== itemId));
  };

  // Update Condition
  const handleUpdateCondition = (itemId: string, condition: ItemCondition) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.waste_item_id === itemId ? { ...i, condition } : i))
    );
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً", {
        description: "يرجى اختيار صورة بحجم أقل من 15 ميجابايت.",
      });
      return;
    }

    try {
      const compressedBase64 = await compressImageClient(file, 1200, 0.8);
      setPhotoPreview(compressedBase64);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Total Calculations
  const totalWeight = selectedItems.reduce(
    (sum, item) => sum + item.unit_weight_kg * item.quantity,
    0
  );
  const totalEstimatedPoints = selectedItems.reduce(
    (sum, item) => sum + Math.round(item.unit_weight_kg * item.quantity * item.points_per_kg),
    0
  );

  // Submit Handler
  const handleSubmitRequest = () => {
    if (selectedItems.length === 0) {
      toast.error("يرجى اختيار الأجهزة أولاً");
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      toast.error("يرجى إدخال العنوان بالتفصيل");
      return;
    }
    if (!city.trim()) {
      toast.error("يرجى إدخال اسم المدينة أو الحي");
      return;
    }
    if (!phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف للتواصل");
      return;
    }

    startTransition(async () => {
      const response = await createCollectionRequestServerAction({
        items: selectedItems.map((item) => ({
          waste_item_id: item.waste_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          weight: item.unit_weight_kg,
          condition: item.condition,
          image_url: photoPreview || null,
        })),
        address: address.trim(),
        city: city.trim(),
        governorate,
        phone: phone.trim(),
        notes: notes.trim() || null,
        images: photoPreview ? [photoPreview] : undefined,
      });

      if (!response.success || !response.requestId) {
        toast.error("تعذر إرسال الطلب", {
          description: response.error || "يرجى التأكد من ملء جميع الحقول المطلوبة.",
        });
        return;
      }

      toast.success("تم إرسال طلب الجمع بنجاح!", {
        description: `رقم الطلب: ${response.requestId.slice(0, 8)}`,
      });

      router.push(`/request/success?id=${response.requestId}`);
    });
  };

  return (
    <div className="space-y-8">
      {/* Wizard Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        <div
          className={`pb-2 border-b-2 transition-colors ${
            currentStep >= 1 ? "border-emerald-600 text-emerald-700" : "border-muted text-muted-foreground"
          }`}
        >
          ١. اختيار الأجهزة
        </div>
        <div
          className={`pb-2 border-b-2 transition-colors ${
            currentStep >= 2 ? "border-emerald-600 text-emerald-700" : "border-muted text-muted-foreground"
          }`}
        >
          ٢. الحالة والصور
        </div>
        <div
          className={`pb-2 border-b-2 transition-colors ${
            currentStep >= 3 ? "border-emerald-600 text-emerald-700" : "border-muted text-muted-foreground"
          }`}
        >
          ٣. العنوان والاستلام
        </div>
        <div
          className={`pb-2 border-b-2 transition-colors ${
            currentStep >= 4 ? "border-emerald-600 text-emerald-700" : "border-muted text-muted-foreground"
          }`}
        >
          ٤. المراجعة والتأكيد
        </div>
      </div>

      {/* STEP 1: Select Waste Items */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">اختر نوع المخلفات الإلكترونية</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                اضغط على الأجهزة التي ترغب في تسليمها لجمع النقاط.
              </p>
            </div>
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="self-start text-xs py-1 px-3">
                تم اختيار {selectedItems.reduce((acc, i) => acc + i.quantity, 0)} قطعة ({formatPoints(totalEstimatedPoints)} نقطة تقديرية)
              </Badge>
            )}
          </div>

          {/* AI Smart Scanner Component */}
          <AIPhotoScanner onItemDetected={handleAIDetectedItem} />

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {ICON_MAP[cat.icon || ""] || <Smartphone className="h-4 w-4" />}
                  <span>{cat.name_ar}</span>
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeCategoryItems.map((item) => {
              const inCart = selectedItems.find((i) => i.waste_item_id === item.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <Card
                  key={item.id}
                  className={`relative transition-all duration-200 ${
                    qty > 0 ? "border-emerald-500 bg-emerald-50/20 shadow-sm" : "hover:border-emerald-200"
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-bold leading-tight">
                        {item.name_ar}
                      </CardTitle>
                      <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        {item.points_per_kg} نقطة/كجم
                      </span>
                    </div>
                    {item.description && (
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      وزن تقديري: {item.estimated_weight_kg * 1000} جم
                    </span>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 rounded-md"
                          onClick={() => handleDecrementItem(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold w-4 text-center">{qty}</span>
                        <Button
                          size="icon"
                          className="h-7 w-7 rounded-md bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleAddItem(item)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleAddItem(item)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        إضافة
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              {selectedItems.length > 0
                ? `تم اختيار ${selectedItems.length} أصناف`
                : "يرجى اختيار جهاز واحد على الأقل للمتابعة"}
            </p>
            <Button
              disabled={selectedItems.length === 0}
              onClick={() => setCurrentStep(2)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              متابعة التفاصيل
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Item Condition & Photo Upload */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">تحديد حالة الأجهزة ورفع الصور</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              ساعدنا في معرفة حالة الأجهزة لتسهيل عملية الفحص والتقييم.
            </p>
          </div>

          {/* Selected Items Detail List */}
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <Card key={item.waste_item_id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.item_name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        الكمية: {item.quantity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      الوزن التقديري الإجمالي: {(item.unit_weight_kg * item.quantity).toFixed(2)} كجم
                    </p>
                  </div>

                  {/* Condition Selector */}
                  <div className="flex flex-wrap gap-1.5">
                    {(["broken", "working", "scrap"] as ItemCondition[]).map((cond) => {
                      const isSelected = item.condition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleUpdateCondition(item.waste_item_id, cond)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-emerald-100 border-emerald-500 text-emerald-800 font-bold"
                              : "bg-muted/30 hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {ITEM_CONDITION_LABELS_AR[cond].label}
                        </button>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(item.waste_item_id)}
                      title="حذف الصنف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Photo Upload Section */}
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-emerald-600" />
                صورة توضيحية للأجهزة (اختياري)
              </CardTitle>
              <CardDescription className="text-xs">
                التقط صورة تجمع الأجهزة للتأكد من المحتويات وتسهيل الفحص السريع.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {photoPreview ? (
                <div className="relative h-44 w-full max-w-sm rounded-xl overflow-hidden border">
                  <Image
                    src={photoPreview}
                    alt="معاينة صورة الأجهزة"
                    fill
                    className="object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 start-2 text-xs h-7"
                    onClick={() => setPhotoPreview(null)}
                  >
                    حذف الصورة
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-center p-4">
                  <UploadCloud className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-semibold text-foreground">اضغط لرفع صورة أو التقاطها بالكاميرا</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP حتى 5 ميجابايت</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Step 2 Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              الرجوع لاختيار الأجهزة
            </Button>
            <Button onClick={() => setCurrentStep(3)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              متابعة العنوان والموقع
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Location & Delivery Details */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">بيانات العنوان وموقع الاستلام</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              سيقوم مندوبنا المعتمد بزيارتك لاستلام الأجهزة ووزنها في موقعك.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Governorate */}
                <div className="space-y-2">
                  <Label htmlFor="governorate" className="font-semibold text-xs">
                    المحافظة
                  </Label>
                  <select
                    id="governorate"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov} className="text-foreground bg-background">
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City / District */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-semibold text-xs">
                    المدينة / الحي
                  </Label>
                  <Input
                    id="city"
                    placeholder="مثال: المعادي / مدينة نصر / الدقي"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="font-semibold text-xs flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  العنوان التفصيلي
                </Label>
                <Input
                  id="address"
                  placeholder="اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-xs">
                  رقم الهاتف للتواصل وتأكيد الموعد
                </Label>
                <Input
                  id="phone"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="font-mono text-start"
                />
              </div>

              {/* Delivery Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-semibold text-xs">
                  ملاحظات إضافية لمندوب الاستلام (اختياري)
                </Label>
                <Input
                  id="notes"
                  placeholder="مثال: يفضل الاستلام بعد الساعة ٤ عصراً"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3 Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              الرجوع لتفاصيل الأجهزة
            </Button>
            <Button
              disabled={!address.trim() || !city.trim() || !phone.trim()}
              onClick={() => setCurrentStep(4)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              مراجعة الطلب والنقاط
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Final Submission */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">مراجعة وتأكيد طلب الجمع</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              راجع تفاصيل أجهزتك والنقاط التقديرية قبل التأكيد النهائي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left/Main Summary: Items & Address */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    الأجهزة المطلوبة للجمع ({selectedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {selectedItems.map((item) => (
                    <div
                      key={item.waste_item_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
                    >
                      <div>
                        <span className="font-bold text-foreground text-sm">{item.item_name}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {item.quantity} قطع &bull; {ITEM_CONDITION_LABELS_AR[item.condition].label}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatPoints(Math.round(item.unit_weight_kg * item.quantity * item.points_per_kg))} نقطة
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Address Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    عنوان الاستلام والتواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">المحافظة والمدينة:</strong> {governorate} — {city}
                  </p>
                  <p>
                    <strong className="text-foreground">العنوان:</strong> {address}
                  </p>
                  <p>
                    <strong className="text-foreground">رقم الهاتف:</strong> <span className="font-mono">{phone}</span>
                  </p>
                  {notes && (
                    <p>
                      <strong className="text-foreground">ملاحظات:</strong> {notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Card: Points Breakdown & Submission */}
            <div className="space-y-4">
              <Card className="border-emerald-300 bg-gradient-to-b from-emerald-50/50 to-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">إجمالي التقدير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-black text-emerald-600">
                      {formatPoints(totalEstimatedPoints)} <span className="text-base font-normal text-muted-foreground">نقطة</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      الوزن التقديري: {totalWeight.toFixed(2)} كجم
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background border text-[11px] text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>كيف تُحسب النقاط؟</span>
                    </div>
                    <p>
                      النقاط الموضحة تقديرية. يتم احتساب النقاط النهائية وتأكيدها فور فحص ووزن الأجهزة بمعرفة المندوب المعتمد.
                    </p>
                  </div>

                  <Button
                    onClick={handleSubmitRequest}
                    disabled={isPending}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-bold shadow-md gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري إرسال الطلب...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        تأكيد وإرسال طلب الجمع
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Step 4 Navigation */}
          <div className="flex justify-start pt-4 border-t">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              الرجوع لتعديل العنوان
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
