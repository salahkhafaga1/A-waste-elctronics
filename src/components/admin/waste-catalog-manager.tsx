"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Recycle,
  Plus,
  Edit,
  Check,
  X,
  Loader2,
  Coins,
  Scale,
  Sparkles,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  upsertWasteCategoryAdminAction,
  upsertWasteItemAdminAction,
  toggleWasteItemActiveAdminAction,
} from "@/app/actions/admin";
import type { WasteCategory, WasteItem } from "@/types/database";

interface WasteCatalogManagerProps {
  categories: WasteCategory[];
  items: (WasteItem & { category?: WasteCategory })[];
}

export function WasteCatalogManager({ categories, items }: WasteCatalogManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<WasteCategory | null>(null);
  const [editingItem, setEditingItem] = useState<WasteItem | null>(null);

  // Category form
  const [catName, setCatName] = useState("");
  const [catNameAr, setCatNameAr] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Item form
  const [itemCatId, setItemCatId] = useState(categories[0]?.id || "");
  const [itemName, setItemName] = useState("");
  const [itemNameAr, setItemNameAr] = useState("");
  const [itemPoints, setItemPoints] = useState("100");
  const [itemPrice, setItemPrice] = useState("10");
  const [itemWeight, setItemWeight] = useState("0.5");

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatNameAr("");
    setCatSlug("");
    setCatDesc("");
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat: WasteCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatNameAr(cat.name_ar);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catNameAr.trim() || !catName.trim()) {
      toast.error("يرجى إدخال اسم التصنيف بالعربية والإنجليزية.");
      return;
    }

    startTransition(async () => {
      const res = await upsertWasteCategoryAdminAction({
        id: editingCategory?.id,
        name: catName.trim(),
        name_ar: catNameAr.trim(),
        slug: catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: catDesc.trim() || undefined,
        is_active: editingCategory ? editingCategory.is_active : true,
      });

      if (!res.success) {
        toast.error("فشل حفظ التصنيف", { description: res.error });
        return;
      }

      toast.success("تم حفظ تصنيف المخلفات بنجاح!");
      setCategoryModalOpen(false);
    });
  };

  const openCreateItem = () => {
    setEditingItem(null);
    setItemCatId(categories[0]?.id || "");
    setItemName("");
    setItemNameAr("");
    setItemPoints("100");
    setItemPrice("10");
    setItemWeight("0.5");
    setItemModalOpen(true);
  };

  const openEditItem = (item: WasteItem) => {
    setEditingItem(item);
    setItemCatId(item.category_id);
    setItemName(item.name);
    setItemNameAr(item.name_ar);
    setItemPoints(item.points_per_kg.toString());
    setItemPrice(item.base_price.toString());
    setItemWeight(item.estimated_weight_kg?.toString() || "0.5");
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemNameAr.trim() || !itemCatId) {
      toast.error("يرجى اختيار التصنيف وإدخال اسم العنصر.");
      return;
    }

    startTransition(async () => {
      const res = await upsertWasteItemAdminAction({
        id: editingItem?.id,
        category_id: itemCatId,
        name: itemName.trim() || itemNameAr.trim(),
        name_ar: itemNameAr.trim(),
        points_per_kg: Number(itemPoints) || 100,
        base_price: Number(itemPrice) || 10,
        estimated_weight_kg: Number(itemWeight) || 0.5,
        is_active: editingItem ? editingItem.is_active : true,
      });

      if (!res.success) {
        toast.error("فشل حفظ العنصر", { description: res.error });
        return;
      }

      toast.success("تم حفظ عنصر المخلفات والتسعير بنجاح!");
      setItemModalOpen(false);
    });
  };

  const handleToggleItemActive = (item: WasteItem) => {
    startTransition(async () => {
      const res = await toggleWasteItemActiveAdminAction(item.id, !item.is_active);
      if (!res.success) {
        toast.error("فشل التحديث", { description: res.error });
        return;
      }
      toast.success(`تم ${item.is_active ? "تعطيل" : "تفعيل"} العنصر بنجاح.`);
    });
  };

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">تصنيفات المخلفات الإلكترونية</h2>
            <p className="text-xs text-muted-foreground">التصنيفات الرئيسية المعروضة في نموذج طلب الجمع</p>
          </div>
          <Button onClick={openCreateCategory} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5">
            <Plus className="h-4 w-4" />
            إضافة تصنيف جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{cat.name_ar}</span>
                  <Badge variant={cat.is_active ? "default" : "outline"} className="text-[10px]">
                    {cat.is_active ? "نشط" : "معطل"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{cat.name} ({cat.slug})</p>
                {cat.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{cat.description}</p>
                )}
              </div>

              <div className="pt-3 mt-2 border-t flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => openEditCategory(cat)} className="text-xs h-7 gap-1">
                  <Edit className="h-3 w-3" />
                  تعديل
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Items & Pricing Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">عناصر المخلفات وقواعد النقاط والتسعير</h2>
            <p className="text-xs text-muted-foreground">تحديد نقاط الكيلوجرام والسعر التقديري لكل جهاز</p>
          </div>
          <Button onClick={openCreateItem} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5">
            <Plus className="h-4 w-4" />
            إضافة عنصر وتسعير
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {item.category?.name_ar || "تصنيف"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => handleToggleItemActive(item)}
                    title={item.is_active ? "تعطيل العنصر" : "تفعيل العنصر"}
                  >
                    <Power className={`h-3.5 w-3.5 ${item.is_active ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </Button>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.name_ar}</h4>
                  <span className="text-[11px] text-muted-foreground font-mono">{item.name}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/30 border grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground">نقاط الكيلو:</span>
                    <p className="font-mono font-bold text-emerald-700">{item.points_per_kg} نقطة/كجم</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">السعر التقديري:</span>
                    <p className="font-mono font-bold text-foreground">{item.base_price} ج.م/كجم</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  وزن تقديري: {item.estimated_weight_kg || 0.5} كجم
                </span>
                <Button variant="ghost" size="sm" onClick={() => openEditItem(item)} className="text-xs h-7 gap-1">
                  <Edit className="h-3 w-3" />
                  تعديل
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Category Upsert Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingCategory ? "تعديل تصنيف مخلفات" : "إضافة تصنيف مخلفات جديد"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              التصنيف يظهر في الخطوة الأولى من نموذج طلب الجمع.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="catNameAr" className="text-xs font-semibold">
                الاسم بالعربية *
              </Label>
              <Input
                id="catNameAr"
                value={catNameAr}
                onChange={(e) => setCatNameAr(e.target.value)}
                placeholder="مثال: الهواتف والتابلت"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-xs font-semibold">
                الاسم بالإنجليزية *
              </Label>
              <Input
                id="catName"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="مثال: Phones & Tablets"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catSlug" className="text-xs">
                المعرف اللطيف (Slug)
              </Label>
              <Input
                id="catSlug"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="phones-and-tablets"
                className="text-xs font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-xs">
                وصف التصنيف
              </Label>
              <Textarea
                id="catDesc"
                rows={2}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="أجهزة الهواتف الذكية واللوحية القديمة والمعطلة..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleSaveCategory} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ التصنيف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Upsert Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingItem ? "تعديل عنصر وتسعير" : "إضافة عنصر مخلفات وتسعير"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              تحديد قواعد احتساب النقاط التقديرية والتسعير للكيلوجرام.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="itemCat" className="text-xs font-semibold">
                التصنيف التابع له *
              </Label>
              <select
                id="itemCat"
                value={itemCatId}
                onChange={(e) => setItemCatId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="itemNameAr" className="text-xs font-semibold">
                اسم العنصر بالعربية *
              </Label>
              <Input
                id="itemNameAr"
                value={itemNameAr}
                onChange={(e) => setItemNameAr(e.target.value)}
                placeholder="مثال: شواحن وكابلات تالفة"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="itemPoints" className="text-xs font-semibold">
                  نقاط الكيلو (Points/kg) *
                </Label>
                <Input
                  id="itemPoints"
                  type="number"
                  value={itemPoints}
                  onChange={(e) => setItemPoints(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="itemPrice" className="text-xs font-semibold">
                  السعر الأساسي (ج.م/كجم) *
                </Label>
                <Input
                  id="itemPrice"
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="itemWeight" className="text-xs">
                الوزن التقديري للقطعة الواحدة (كجم)
              </Label>
              <Input
                id="itemWeight"
                type="number"
                step="0.05"
                value={itemWeight}
                onChange={(e) => setItemWeight(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setItemModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleSaveItem} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ العنصر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
