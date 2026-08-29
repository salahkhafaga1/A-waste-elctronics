"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Scale,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  ArrowRight,
  Sparkles,
  Ban,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateRequestStatusAdminAction,
  verifyRequestAndAwardPointsAdminAction,
} from "@/app/actions/admin";
import type { RequestStatus, CollectionRequest } from "@/types/database";

interface RequestActionsProps {
  request: CollectionRequest;
}

export function RequestActions({ request }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const [newStatus, setNewStatus] = useState<RequestStatus>(request.status);
  const [statusNotes, setStatusNotes] = useState(request.notes || "");

  // Weight Verification fields
  const [verifiedWeight, setVerifiedWeight] = useState<string>(
    request.verified_weight?.toString() || request.estimated_weight.toString()
  );
  // Default calculation: 100 points per kg (or proportional to estimated)
  const defaultCalculatedPoints = Math.round(
    (Number(verifiedWeight) || request.estimated_weight) *
      (request.estimated_points > 0
        ? request.estimated_points / (request.estimated_weight || 1)
        : 100)
  );
  const [finalPoints, setFinalPoints] = useState<string>(
    request.final_points?.toString() || defaultCalculatedPoints.toString()
  );
  const [verificationNotes, setVerificationNotes] = useState("");

  const handleUpdateStatus = () => {
    startTransition(async () => {
      const res = await updateRequestStatusAdminAction(
        request.id,
        newStatus,
        statusNotes.trim() || undefined
      );

      if (!res.success) {
        toast.error("فشل تحديث الحالة", { description: res.error });
        return;
      }

      toast.success("تم تحديث حالة الطلب بنجاح!");
      setStatusModalOpen(false);
    });
  };

  const handleVerifyAndAward = () => {
    const weightNum = parseFloat(verifiedWeight);
    const pointsNum = parseInt(finalPoints, 10);

    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("يرجى إدخال وزن حقيقي معتمد بالكيلوجرام (أكبر من 0).");
      return;
    }

    if (isNaN(pointsNum) || pointsNum <= 0) {
      toast.error("يرجى إدخال عدد نقاط نهائي صالح (أكبر من 0).");
      return;
    }

    startTransition(async () => {
      const res = await verifyRequestAndAwardPointsAdminAction({
        requestId: request.id,
        verifiedWeight: weightNum,
        finalPoints: pointsNum,
        notes: verificationNotes.trim() || undefined,
      });

      if (!res.success) {
        toast.error("فشل اعتماد الطلب", { description: res.error });
        return;
      }

      toast.success("تم اعتماد الطلب واحتساب النقاط للمستخدم بنجاح!");
      setVerifyModalOpen(false);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Verify Weight & Award Points Button */}
      {request.status !== "verified" && request.status !== "recycled" && request.status !== "cancelled" && (
        <Button
          onClick={() => setVerifyModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
        >
          <Scale className="h-3.5 w-3.5" />
          وزن واعتماد النقاط
        </Button>
      )}

      {/* Change Status Button */}
      <Button
        variant="outline"
        onClick={() => setStatusModalOpen(true)}
        className="text-xs gap-1.5"
      >
        <Truck className="h-3.5 w-3.5 text-muted-foreground" />
        تغيير الحالة
      </Button>

      {/* Verify Weight & Final Points Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <Sparkles className="h-4 w-4" />
              <span>التحقق الفيزيائي ومنح المكافأة</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              فحص الوزن واعتماد النقاط
            </DialogTitle>
            <DialogDescription className="text-xs">
              سيتم تسجيل الوزن المعتمد، وتحويل الطلب إلى معتمد (Verified)، وإضافة النقاط إلى محفظة العميل فوراً.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Comparison banner */}
            <div className="p-3.5 rounded-xl bg-muted/30 border grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground text-[11px]">الوزن التقديري للعميل:</span>
                <p className="font-bold text-foreground font-mono mt-0.5">{request.estimated_weight} كجم</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">النقاط التقديرية:</span>
                <p className="font-bold text-foreground font-mono mt-0.5">{request.estimated_points} نقطة</p>
              </div>
            </div>

            {/* Input: Verified Weight */}
            <div className="space-y-2">
              <Label htmlFor="verifiedWeight" className="text-xs font-semibold">
                الوزن الفعلي المعتمد (كيلوجرام) *
              </Label>
              <div className="relative">
                <Scale className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="verifiedWeight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={verifiedWeight}
                  onChange={(e) => {
                    setVerifiedWeight(e.target.value);
                    const w = parseFloat(e.target.value);
                    if (!isNaN(w) && w > 0) {
                      const pts = Math.round(
                        w * (request.estimated_points > 0 ? request.estimated_points / (request.estimated_weight || 1) : 100)
                      );
                      setFinalPoints(pts.toString());
                    }
                  }}
                  className="pr-9 font-mono"
                  placeholder="مثال: 2.5"
                />
              </div>
            </div>

            {/* Input: Final Points */}
            <div className="space-y-2">
              <Label htmlFor="finalPoints" className="text-xs font-semibold">
                إجمالي النقاط المعتمدة الممنوحة للعميل *
              </Label>
              <div className="relative">
                <Coins className="absolute right-3 top-2.5 h-4 w-4 text-emerald-600" />
                <Input
                  id="finalPoints"
                  type="number"
                  min="1"
                  value={finalPoints}
                  onChange={(e) => setFinalPoints(e.target.value)}
                  className="pr-9 font-mono font-bold text-emerald-700"
                  placeholder="مثال: 250"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="vNotes" className="text-xs">
                ملاحظات الفحص والاعتماد (اختياري)
              </Label>
              <Textarea
                id="vNotes"
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="مثال: تم فحص الأجهزة وتبين صلاحية بعض اللوحات الإلكترونية."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setVerifyModalOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleVerifyAndAward}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الاعتماد والتحويل...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  تأكيد الاعتماد ومنح النقاط
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              تحديث مرحلة الطلب
            </DialogTitle>
            <DialogDescription className="text-xs">
              تعديل الحالة التشغيلية للطلب في خط سير التجميع والتدوير.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">اختر الحالة الجديدة:</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "pending", label: "قيد الانتظار" },
                    { id: "confirmed", label: "تم التأكيد" },
                    { id: "assigned", label: "تم التعيين للمندوب" },
                    { id: "collected", label: "تم الاستلام" },
                    { id: "verified", label: "معتمد وموزون" },
                    { id: "recycled", label: "تم التدوير النهائي" },
                    { id: "cancelled", label: "ملغي" },
                  ] as { id: RequestStatus; label: string }[]
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setNewStatus(st.id)}
                    className={`p-2.5 rounded-lg border text-start transition-all font-medium ${
                      newStatus === st.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stNotes" className="text-xs">
                ملاحظات التحديث:
              </Label>
              <Textarea
                id="stNotes"
                rows={2}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="مثال: تم الاتصال بالعميل وتحديد موعد الاستلام غداً."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setStatusModalOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ التحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
