"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Truck,
  Calendar,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Building2,
  Loader2,
  Edit,
  ArrowRight,
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
  assignPartnerToRequestAdminAction,
  updatePickupStatusAdminAction,
} from "@/app/actions/partners";
import { PICKUP_STATUS_LABELS_AR } from "@/constants/partners";
import type { Partner, PickupAssignment, PickupStatus } from "@/types/database";

interface PickupAssignmentWidgetProps {
  requestId: string;
  currentAssignment: PickupAssignment | null;
  availablePartners: Partner[];
}

export function PickupAssignmentWidget({
  requestId,
  currentAssignment,
  availablePartners,
}: PickupAssignmentWidgetProps) {
  const [isPending, startTransition] = useTransition();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Form states
  const transportPartners = availablePartners.filter(
    (p) => p.type === "transport" || p.type === "recycler"
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState(
    currentAssignment?.partner_id || transportPartners[0]?.id || ""
  );
  const [scheduledAt, setScheduledAt] = useState(
    currentAssignment?.scheduled_at ? currentAssignment.scheduled_at.slice(0, 16) : ""
  );
  const [driverName, setDriverName] = useState(currentAssignment?.driver_name || "");
  const [driverPhone, setDriverPhone] = useState(currentAssignment?.driver_phone || "");
  const [notes, setNotes] = useState(currentAssignment?.notes || "");
  const [newPickupStatus, setNewPickupStatus] = useState<PickupStatus>(
    currentAssignment?.status || "assigned"
  );

  const handleAssign = () => {
    if (!selectedPartnerId) {
      toast.error("يرجى اختيار شركة النقل أو الشريك المسند إليه الطلب.");
      return;
    }

    startTransition(async () => {
      const res = await assignPartnerToRequestAdminAction({
        requestId,
        partnerId: selectedPartnerId,
        scheduledAt: scheduledAt || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        toast.error("فشل إسناد الشريك", { description: res.error });
        return;
      }

      toast.success("تم إسناد الطلب للشريك وتحديث خط السير بنجاح!");
      setAssignModalOpen(false);
    });
  };

  const handleUpdatePickupStatus = () => {
    if (!currentAssignment) return;

    startTransition(async () => {
      const res = await updatePickupStatusAdminAction({
        assignmentId: currentAssignment.id,
        requestId,
        newStatus: newPickupStatus,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        toast.error("فشل تحديث حالة الاستلام", { description: res.error });
        return;
      }

      toast.success("تم تحديث مرحلة الاستلام بنجاح!");
      setStatusModalOpen(false);
    });
  };

  const statusBadge = currentAssignment
    ? PICKUP_STATUS_LABELS_AR[currentAssignment.status] || {
        label: currentAssignment.status,
        badgeVariant: "secondary" as const,
      }
    : null;

  return (
    <Card className="border-amber-200/80">
      <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-600" />
            الشريك اللوجستي وموعد الاستلام الميداني
          </CardTitle>
          <CardDescription className="text-xs">
            إسناد الطلب لأسطول النقل أو مندوب التجميع وتحديد موعد الزيارة
          </CardDescription>
        </div>

        {currentAssignment ? (
          <div className="flex items-center gap-2">
            <Badge variant={statusBadge?.badgeVariant} className="text-[10px]">
              {statusBadge?.label}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              className="text-xs h-7 gap-1"
            >
              تحديث المرحلة
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAssignModalOpen(true)}
              className="text-xs h-7 gap-1"
            >
              <Edit className="h-3 w-3" />
              تعديل
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setAssignModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 h-8"
          >
            <Truck className="h-3.5 w-3.5" />
            إسناد لشريك نقل
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 text-xs space-y-3">
        {currentAssignment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/20 border">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{currentAssignment.partner?.name_ar || "شريك النقل"}</span>
              </div>
              {currentAssignment.scheduled_at && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>
                    موعد الاستلام:{" "}
                    <strong className="text-foreground font-mono">
                      {new Date(currentAssignment.scheduled_at).toLocaleString("ar-EG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {currentAssignment.driver_name && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>المندوب: <strong className="text-foreground">{currentAssignment.driver_name}</strong></span>
                </div>
              )}
              {currentAssignment.driver_phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span dir="ltr" className="font-mono font-bold text-foreground">{currentAssignment.driver_phone}</span>
                </div>
              )}
            </div>

            {currentAssignment.notes && (
              <div className="col-span-full pt-2 border-t text-muted-foreground">
                <span>ملاحظات الشحن: </span>
                <span className="italic">{currentAssignment.notes}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-2">
            لم يتم إسناد هذا الطلب لأي شريك نقل أو مندوب بعد. انقر على &quot;إسناد لشريك نقل&quot; لجدولة الزيارة.
          </p>
        )}
      </CardContent>

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              إسناد الطلب وجدولة الاستلام
            </DialogTitle>
            <DialogDescription className="text-xs">
              اختر أسطول النقل أو مندوب التجميع وحدد موعد الزيارة الميدانية.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">شريك النقل / الأسطول *</Label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {transportPartners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_ar} ({p.governorate})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">الموعد المجدول للاستلام</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">اسم السائق / المندوب</Label>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="مثال: كابتن محمد"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">هاتف السائق</Label>
                <Input
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="01012345678"
                  className="text-xs font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ملاحظات للمندوب</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تعليمات الدخول أو تفاصيل الموقع..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleAssign} disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد الإسناد والجدولة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pickup Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              تحديث مرحلة الاستلام الميداني
            </DialogTitle>
            <DialogDescription className="text-xs">
              تغيير حالة الشحنة اللوجستية مع المندوب.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "assigned", label: "تم التعيين للشريك" },
                  { id: "scheduled", label: "تم جدولة الموعد" },
                  { id: "in_progress", label: "المندوب في الطريق" },
                  { id: "completed", label: "تم الاستلام من العميل" },
                  { id: "cancelled", label: "إلغاء الاستلام" },
                ] as { id: PickupStatus; label: string }[]
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setNewPickupStatus(st.id)}
                  className={`p-2.5 rounded-lg border text-start transition-all font-medium ${
                    newPickupStatus === st.id
                      ? "border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-sm"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setStatusModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleUpdatePickupStatus} disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ التحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
