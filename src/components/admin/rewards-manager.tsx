"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Gift,
  Plus,
  Edit,
  Power,
  Loader2,
  Wallet,
  Trees,
  HeartHandshake,
  ShoppingBag,
  Coins,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  upsertRewardAdminAction,
  toggleRewardActiveAdminAction,
} from "@/app/actions/admin";
import { REWARD_CATEGORY_LABELS_AR } from "@/constants/rewards";
import { formatPoints } from "@/lib/utils";
import type { Reward, RewardCategory } from "@/types/database";

interface RewardsManagerProps {
  rewards: Reward[];
}

export function RewardsManager({ rewards }: RewardsManagerProps) {
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [category, setCategory] = useState<RewardCategory>("voucher");
  const [pointsCost, setPointsCost] = useState("500");
  const [monetaryValue, setMonetaryValue] = useState("50");
  const [stockQuantity, setStockQuantity] = useState("100");
  const [expiryDays, setExpiryDays] = useState("30");
  const [description, setDescription] = useState("");

  const openCreateModal = () => {
    setEditingReward(null);
    setTitle("");
    setTitleAr("");
    setPartnerName("");
    setCategory("voucher");
    setPointsCost("500");
    setMonetaryValue("50");
    setStockQuantity("100");
    setExpiryDays("30");
    setDescription("");
    setModalOpen(true);
  };

  const openEditModal = (reward: Reward) => {
    setEditingReward(reward);
    setTitle(reward.title);
    setTitleAr(reward.title_ar);
    setPartnerName(reward.partner_name);
    setCategory(reward.category);
    setPointsCost(reward.points_cost.toString());
    setMonetaryValue(reward.monetary_value.toString());
    setStockQuantity(reward.stock_quantity.toString());
    setExpiryDays(reward.expiry_days.toString());
    setDescription(reward.description || "");
    setModalOpen(true);
  };

  const handleSaveReward = () => {
    if (!titleAr.trim() || !partnerName.trim()) {
      toast.error("يرجى إدخال اسم المكافأة والجهة/الشريك.");
      return;
    }

    startTransition(async () => {
      const res = await upsertRewardAdminAction({
        id: editingReward?.id,
        title: title.trim() || titleAr.trim(),
        title_ar: titleAr.trim(),
        partner_name: partnerName.trim(),
        category,
        points_cost: Number(pointsCost) || 500,
        monetary_value: Number(monetaryValue) || 50,
        stock_quantity: Number(stockQuantity) || 100,
        expiry_days: Number(expiryDays) || 30,
        description: description.trim() || undefined,
        is_active: editingReward ? editingReward.is_active : true,
      });

      if (!res.success) {
        toast.error("فشل حفظ المكافأة", { description: res.error });
        return;
      }

      toast.success("تم حفظ المكافأة بنجاح!");
      setModalOpen(false);
    });
  };

  const handleToggleActive = (reward: Reward) => {
    startTransition(async () => {
      const res = await toggleRewardActiveAdminAction(reward.id, !reward.is_active);
      if (!res.success) {
        toast.error("فشل التحديث", { description: res.error });
        return;
      }
      toast.success(`تم ${reward.is_active ? "تعطيل" : "تفعيل"} المكافأة بنجاح.`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">قائمة المكافآت والقسائم الحالية</h2>
          <p className="text-xs text-muted-foreground">تحكم في أسعار النقاط، المخزون، وتفعيل/تعطيل العروض</p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5">
          <Plus className="h-4 w-4" />
          إضافة مكافأة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="p-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {REWARD_CATEGORY_LABELS_AR[reward.category]?.label || reward.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => handleToggleActive(reward)}
                    title={reward.is_active ? "تعطيل المكافأة" : "تفعيل المكافأة"}
                  >
                    <Power className={`h-3.5 w-3.5 ${reward.is_active ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground">{reward.title_ar}</h4>
                <p className="text-xs text-muted-foreground">{reward.partner_name}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground">النقاط المطلوبة:</span>
                  <p className="font-mono font-bold text-emerald-700">{formatPoints(reward.points_cost)} نقطة</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">القيمة المادية:</span>
                  <p className="font-mono font-bold text-foreground">{reward.monetary_value} جنيه</p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">
                المخزون: <strong>{reward.stock_quantity}</strong> • الصلاحية: <strong>{reward.expiry_days} يوم</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={() => openEditModal(reward)} className="text-xs h-7 gap-1">
                <Edit className="h-3 w-3" />
                تعديل
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reward Upsert Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingReward ? "تعديل مكافأة / قسيمة" : "إضافة مكافأة جديدة"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              تحديد الشريك، عدد النقاط المطلوبة، والقيمة المالية.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rewCat" className="text-xs font-semibold">
                  نوع المكافأة *
                </Label>
                <select
                  id="rewCat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RewardCategory)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="cash">سحب كاش ومحافظ إلكترونية</option>
                  <option value="tree">زراعة شجرة بيئية</option>
                  <option value="donation">تبرع لمستشفى 57357</option>
                  <option value="voucher">قسيمة شراء وتسوق</option>
                  <option value="discount">خصومات الهايبرماركت</option>
                  <option value="cashback">شحن رصيد اتصالات</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="partnerName" className="text-xs font-semibold">
                  الشريك / الجهة *
                </Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="مثال: نون مصر أو فودافون كاش"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleAr" className="text-xs font-semibold">
                عنوان المكافأة بالعربية *
              </Label>
              <Input
                id="titleAr"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: قسيمة شراء نون مصر 100 جنيه"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ptsCost" className="text-xs font-semibold">
                  تكلفة النقاط المطلوبة *
                </Label>
                <Input
                  id="ptsCost"
                  type="number"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monVal" className="text-xs font-semibold">
                  القيمة المادية التقديرية (ج.م) *
                </Label>
                <Input
                  id="monVal"
                  type="number"
                  value={monetaryValue}
                  onChange={(e) => setMonetaryValue(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stkQty" className="text-xs">
                  الكمية المتاحة (المخزون)
                </Label>
                <Input
                  id="stkQty"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expDays" className="text-xs">
                  فترة الصلاحية (بالأيام)
                </Label>
                <Input
                  id="expDays"
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rDesc" className="text-xs">
                وصف المكافأة وشروط الاستخدام
              </Label>
              <Textarea
                id="rDesc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="شرح طريقة الاستخدام وأي كود ترويجي إضافي..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleSaveReward} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ المكافأة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
