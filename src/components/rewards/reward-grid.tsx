"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Gift,
  Coins,
  ShoppingBag,
  Percent,
  Wallet,
  HeartHandshake,
  Trees,
  Package,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Ticket,
  Calendar,
  Phone,
  User,
  Heart,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { redeemRewardServerAction } from "@/app/actions/rewards";
import { REWARD_CATEGORY_LABELS_AR } from "@/constants/rewards";
import { formatPoints } from "@/lib/utils";
import type { Reward, RewardCategory, Redemption } from "@/types/database";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Gift className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  tree: <Trees className="h-4 w-4" />,
  donation: <HeartHandshake className="h-4 w-4" />,
  voucher: <ShoppingBag className="h-4 w-4" />,
  discount: <Percent className="h-4 w-4" />,
  cashback: <Coins className="h-4 w-4" />,
  product: <Package className="h-4 w-4" />,
};

interface RewardGridProps {
  rewards: Reward[];
  userPointsBalance: number;
  isLoggedIn: boolean;
}

export function RewardGrid({ rewards, userPointsBalance, isLoggedIn }: RewardGridProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [successRedemption, setSuccessRedemption] = useState<Redemption | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form metadata inputs
  const [payoutPhone, setPayoutPhone] = useState("");
  const [payoutName, setPayoutName] = useState("");
  const [treeDedicationName, setTreeDedicationName] = useState("");
  const [donorName, setDonorName] = useState("");

  const filteredRewards = rewards.filter((reward) => {
    if (selectedCategory === "all") return true;
    return reward.category === selectedCategory;
  });

  const handleOpenRedeemModal = (reward: Reward) => {
    setSelectedReward(reward);
    setPayoutPhone("");
    setPayoutName("");
    setTreeDedicationName("");
    setDonorName("");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("تم نسخ الرمز بنجاح!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleConfirmRedemption = () => {
    if (!selectedReward) return;

    // Validation for cash payout
    if (selectedReward.category === "cash") {
      if (!payoutPhone.trim() || payoutPhone.trim().length < 8) {
        toast.error("يرجى إدخال رقم هاتف المحفظة أو حساب إنستاباي بشكل صحيح.");
        return;
      }
    }

    const metadata: Record<string, any> = {};
    if (selectedReward.category === "cash") {
      metadata.payout_phone = payoutPhone.trim();
      metadata.payout_account_name = payoutName.trim() || "غير محدد";
      metadata.payout_method = "Vodafone Cash / InstaPay";
    } else if (selectedReward.category === "tree") {
      metadata.dedication_name = treeDedicationName.trim() || "مساهم بيئي";
    } else if (selectedReward.category === "donation") {
      metadata.donor_name = donorName.trim() || "فاعل خير";
      metadata.charity = "57357";
    }

    startTransition(async () => {
      const response = await redeemRewardServerAction(selectedReward.id, metadata);

      if (!response.success || !response.data) {
        toast.error("تعذر استبدال المكافأة", {
          description: response.error || "يرجى المحاولة مرة أخرى لاحقاً.",
        });
        setSelectedReward(null);
        return;
      }

      setSuccessRedemption(response.data);
      setSelectedReward(null);

      if (response.data.status === "pending") {
        toast.success("تم تسجيل طلب السحب النقدي بنجاح! سيتم التحويل بعد المراجعة.");
      } else {
        toast.success("مبروك! تم استبدال المكافأة بنجاح.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>جميع المكافآت ({rewards.length})</span>
        </button>

        {(["cash", "tree", "donation", "voucher", "discount"] as RewardCategory[]).map(
          (cat) => {
            const count = rewards.filter((r) => r.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {CATEGORY_ICONS[cat] || <Gift className="h-4 w-4" />}
                <span>
                  {REWARD_CATEGORY_LABELS_AR[cat]?.label || cat} ({count})
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Rewards Cards Grid */}
      {filteredRewards.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-muted/10">
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-base">لا توجد مكافآت متاحة في هذا التصنيف حالياً</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            نقوم بإضافة شركاء ومكافآت جديدة باستمرار. تصفح باقي التصنيفات لاكتشاف المكافآت المتاحة.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const hasEnoughPoints = userPointsBalance >= reward.points_cost;
            const pointsNeeded = reward.points_cost - userPointsBalance;
            const categoryLabel = REWARD_CATEGORY_LABELS_AR[reward.category]?.label || reward.category;

            return (
              <Card
                key={reward.id}
                className="flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-[11px] font-semibold flex items-center gap-1">
                      {CATEGORY_ICONS[reward.category]}
                      <span>{reward.partner_name}</span>
                    </Badge>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                      {formatPoints(reward.points_cost)} نقطة
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold leading-snug">
                    {reward.title_ar}
                  </CardTitle>

                  {reward.description && (
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {reward.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-muted-foreground">
                    <span>القيمة التقديرية:</span>
                    <strong className="font-bold text-foreground text-sm font-mono">
                      {reward.monetary_value} جنيه مصري
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      صلاحية {reward.expiry_days} يوم
                    </span>
                    <span>
                      {reward.category === "cash"
                        ? "تحويل كاش فوري"
                        : reward.category === "tree"
                        ? "شهادة بيئية"
                        : reward.category === "donation"
                        ? "إيصال تبرع 57357"
                        : `المتبقي: ${reward.stock_quantity}`}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  {!isLoggedIn ? (
                    <Link href={`/login?redirect_url=/rewards`} className="w-full">
                      <Button variant="outline" className="w-full text-xs">
                        سجل دخولك للاستبدال
                      </Button>
                    </Link>
                  ) : hasEnoughPoints ? (
                    <Button
                      onClick={() => handleOpenRedeemModal(reward)}
                      className={`w-full gap-1.5 text-xs font-bold shadow-sm ${
                        reward.category === "cash"
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : reward.category === "tree"
                          ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                          : reward.category === "donation"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {reward.category === "cash" ? (
                        <>
                          <Wallet className="h-3.5 w-3.5" />
                          طلب تحويل كاش
                        </>
                      ) : reward.category === "tree" ? (
                        <>
                          <Trees className="h-3.5 w-3.5" />
                          زراعة الشجرة الآن
                        </>
                      ) : reward.category === "donation" ? (
                        <>
                          <HeartHandshake className="h-3.5 w-3.5" />
                          التبرع لمستشفى 57357
                        </>
                      ) : (
                        <>
                          <Ticket className="h-3.5 w-3.5" />
                          استبدال القسيمة
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full text-xs text-muted-foreground bg-muted/20"
                      title={`تحتاج ${formatPoints(pointsNeeded)} نقطة إضافية`}
                    >
                      ينقصك {formatPoints(pointsNeeded)} نقطة
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dynamic Confirmation Redemption Modal */}
      {selectedReward && (
        <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
                <Sparkles className="h-4 w-4" />
                <span>
                  {selectedReward.category === "cash"
                    ? "طلب تحويل كاش ومحافظ إلكترونية"
                    : selectedReward.category === "tree"
                    ? "تأكيد زراعة شجرة بيئية"
                    : selectedReward.category === "donation"
                    ? "تأكيد التبرع لمستشفى 57357"
                    : "تأكيد استبدال القسيمة"}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold">
                {selectedReward.title_ar}
              </DialogTitle>
              <DialogDescription className="text-xs">
                الشريك / الجهة: {selectedReward.partner_name}
              </DialogDescription>
            </DialogHeader>

            {/* Custom Inputs based on category */}
            <div className="space-y-4 my-2">
              {/* Cash Payout Form Fields */}
              {selectedReward.category === "cash" && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Wallet className="h-4 w-4 text-amber-700" />
                    <span>بيانات استلام التحويل النقدي</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payoutPhone" className="text-xs">
                      رقم محفظة فودافون كاش / أو معرف إنستاباي (مطلوب)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="payoutPhone"
                        placeholder="مثال: 01012345678 أو username@instapay"
                        value={payoutPhone}
                        onChange={(e) => setPayoutPhone(e.target.value)}
                        className="pr-9 text-xs"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payoutName" className="text-xs">
                      اسم صاحب المحفظة أو الحساب (اختياري)
                    </Label>
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="payoutName"
                        placeholder="الاسم المسجل به خط المحفظة"
                        value={payoutName}
                        onChange={(e) => setPayoutName(e.target.value)}
                        className="pr-9 text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    * ملاحظة: يتم مراجعة طلب التحويل وتحويل المبلغ فوراً إلى رقم المحفظة المسجل خلال 24 ساعة.
                  </p>
                </div>
              )}

              {/* Tree Planting Fields */}
              {selectedReward.category === "tree" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Trees className="h-4 w-4 text-emerald-700" />
                    <span>إهداء الشجرة وشهادة الغرس</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treeDedication" className="text-xs">
                      الاسم المراد تسجيل الشجرة به في الشهادة البيئية (اختياري)
                    </Label>
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="treeDedication"
                        placeholder="مثال: باسم أحمد مصطفى أو إهداء لوالدي"
                        value={treeDedicationName}
                        onChange={(e) => setTreeDedicationName(e.target.value)}
                        className="pr-9 text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    * يتم غرس الشجرة عبر مبادرة شجرها ومصر الخضراء وتوثيق الشهادة الرقمية فوراً.
                  </p>
                </div>
              )}

              {/* Donation Fields */}
              {selectedReward.category === "donation" && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <Heart className="h-4 w-4 text-rose-600" />
                    <span>بيانات التبرع لمستشفى 57357</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donorName" className="text-xs">
                      اسم المتبرع (أو اتركه فارغاً ليكون فاعل خير)
                    </Label>
                    <div className="relative">
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="donorName"
                        placeholder="فاعل خير"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="pr-9 text-xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-tight">
                    * يذهب كامل ريع النقاط لصالح علاج أطفال مستشفى 57357 لعلاج الأورام.
                  </p>
                </div>
              )}

              {/* Summary of Points */}
              <div className="p-4 rounded-xl bg-muted/30 border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">النقاط المطلوبة للاستبدال:</span>
                  <strong className="text-emerald-700 font-bold font-mono text-sm">
                    {formatPoints(selectedReward.points_cost)} نقطة
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">رصيدك الحالي:</span>
                  <span className="font-mono">{formatPoints(userPointsBalance)} نقطة</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t font-semibold">
                  <span>الرصيد المتبقي بعد الاستبدال:</span>
                  <span className="font-mono text-foreground font-bold">
                    {formatPoints(userPointsBalance - selectedReward.points_cost)} نقطة
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedReward(null)}
                disabled={isPending}
                className="w-full sm:w-auto text-xs"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleConfirmRedemption}
                disabled={isPending}
                className={`w-full sm:w-auto text-xs font-bold gap-2 ${
                  selectedReward.category === "cash"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : selectedReward.category === "tree"
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : selectedReward.category === "donation"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري إتمام العملية...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    تأكيد وخصم النقاط
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Modal */}
      {successRedemption && (
        <Dialog open={!!successRedemption} onOpenChange={() => setSuccessRedemption(null)}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 mx-auto my-2 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl font-bold">
                {successRedemption.status === "pending"
                  ? "تم تسجيل طلب السحب بنجاح!"
                  : successRedemption.voucher_code?.startsWith("TREE")
                  ? "تم تسجيل غرس الشجرة بنجاح!"
                  : successRedemption.voucher_code?.startsWith("DON")
                  ? "جزاك الله خيراً! تم التبرع بنجاح"
                  : "تم إنشاء قسيمتك بنجاح!"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                {successRedemption.status === "pending"
                  ? "تم إرسال طلب التحويل النقدي للإدارة وسيتم إرسال المبلغ إلى محفظتك الإلكترونية."
                  : successRedemption.voucher_code?.startsWith("TREE")
                  ? "تم إصدار الشهادة البيئية المعتمدة لزراعة الشجرة."
                  : successRedemption.voucher_code?.startsWith("DON")
                  ? "تم توجيه مبلغ التبرع بالكامل إلى مستشفى 57357."
                  : "استخدم الرمز التالي عند الشراء أو الشحن لدى الشريك."}
              </DialogDescription>
            </DialogHeader>

            {/* Code / Reference Box */}
            <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800">
                {successRedemption.status === "pending"
                  ? "رقم طلب التحويل المرجعي"
                  : successRedemption.voucher_code?.startsWith("TREE")
                  ? "رقم الشهادة البيئية"
                  : successRedemption.voucher_code?.startsWith("DON")
                  ? "رقم إيصال التبرع الرسمي"
                  : "رمز القسيمة المعتمد"}
              </span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-black font-mono tracking-widest text-emerald-950 select-all">
                  {successRedemption.voucher_code}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => handleCopyCode(successRedemption.voucher_code)}
                  title="نسخ الرمز"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                صالحة حتى {new Date(successRedemption.expires_at).toLocaleDateString("ar-EG")}
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link href="/rewards/history" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold gap-1.5">
                  <Ticket className="h-4 w-4" />
                  عرض في سجل المكافآت
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
