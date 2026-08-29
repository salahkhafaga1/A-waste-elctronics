"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet,
  Coins,
  AlertTriangle,
  RotateCcw,
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
import { updateRedemptionStatusAdminAction } from "@/app/actions/admin";
import type { Redemption, RedemptionStatus } from "@/types/database";

interface RedemptionActionsProps {
  redemption: Redemption;
}

export function RedemptionActions({ redemption }: RedemptionActionsProps) {
  const [isPending, startTransition] = useTransition();

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleUpdateStatus = (newStatus: RedemptionStatus) => {
    startTransition(async () => {
      const res = await updateRedemptionStatusAdminAction({
        redemptionId: redemption.id,
        newStatus,
        notes: adminNotes.trim() || undefined,
      });

      if (!res.success) {
        toast.error("فشل التحديث", { description: res.error });
        return;
      }

      if (newStatus === "completed") {
        toast.success("تم تأكيد وإتمام التحويل النقدي بنجاح!");
        setApproveModalOpen(false);
      } else if (newStatus === "rejected") {
        toast.success("تم رفض الطلب واسترجاع النقاط إلى محفظة المستخدم بنجاح.");
        setRejectModalOpen(false);
      }
    });
  };

  if (redemption.status === "completed" || redemption.status === "used") {
    return (
      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        مكتمل ومعتمد
      </span>
    );
  }

  if (redemption.status === "rejected" || redemption.status === "cancelled") {
    return (
      <span className="text-xs text-destructive font-semibold flex items-center gap-1">
        <XCircle className="h-3.5 w-3.5" />
        ملغي / تم استرداد النقاط
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Approve button */}
      <Button
        size="sm"
        onClick={() => setApproveModalOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        تأكيد التحويل
      </Button>

      {/* Reject button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setRejectModalOpen(true)}
        className="text-destructive hover:bg-destructive/10 text-xs h-8 gap-1 border-destructive/30"
      >
        <XCircle className="h-3.5 w-3.5" />
        رفض واسترجاع
      </Button>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>تأكيد إرسال التحويل النقدي</span>
            </div>
            <DialogTitle className="text-base font-bold">
              تأكيد تحويل الكاش للعميل
            </DialogTitle>
            <DialogDescription className="text-xs">
              تأكيد أنك قمت بتحويل المبلغ إلى رقم محفظة فودافون كاش / إنستاباي الخاصة بالعميل.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div>
                المبلغ المستحق: <strong>{redemption.reward?.monetary_value || redemption.metadata?.monetary_value || 50} جنيه</strong>
              </div>
              <div>
                رقم المحفظة: <strong dir="ltr" className="font-mono">{redemption.metadata?.payout_phone || "غير محدد"}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appNotes" className="text-xs">
                رقم الحوالة المرجعي أو ملاحظات الإرسال (اختياري)
              </Label>
              <Input
                id="appNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="مثال: تم التحويل بنجاح رقم العملية 84729103"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setApproveModalOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => handleUpdateStatus("completed")}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد وإغلاق الطلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive text-xs font-semibold mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>رفض طلب السحب واسترجاع النقاط</span>
            </div>
            <DialogTitle className="text-base font-bold">
              رفض العملية وإعادة النقاط للمحفظة
            </DialogTitle>
            <DialogDescription className="text-xs">
              سيتم رفض هذا الطلب وإعادة ({redemption.points_spent} نقطة) تلقائياً إلى محفظة المستخدم عبر سجل المعاملات.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="rejNotes" className="text-xs">
                سبب الرفض (سيظهر في سجل الاسترداد للعميل)
              </Label>
              <Textarea
                id="rejNotes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="مثال: رقم المحفظة غير صحيح أو غير مسجل في الخدمة."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              تراجع
            </Button>
            <Button
              onClick={() => handleUpdateStatus("rejected")}
              disabled={isPending}
              variant="destructive"
              className="text-xs font-bold gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد الرفض واسترجاع النقاط"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
