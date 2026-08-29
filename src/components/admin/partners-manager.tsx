"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Edit,
  Power,
  Loader2,
  Truck,
  MapPin,
  Factory,
  Store,
  Phone,
  Mail,
  Clock,
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
  upsertPartnerAdminAction,
  togglePartnerStatusAdminAction,
} from "@/app/actions/partners";
import {
  PARTNER_TYPE_LABELS_AR,
  PARTNER_STATUS_LABELS_AR,
} from "@/constants/partners";
import { EGYPTIAN_GOVERNORATES } from "@/constants/waste";
import type { Partner, PartnerType, PartnerStatus } from "@/types/database";

const TYPE_ICONS: Record<PartnerType, React.ReactNode> = {
  recycler: <Factory className="h-4 w-4 text-emerald-700" />,
  collection_point: <MapPin className="h-4 w-4 text-blue-700" />,
  transport: <Truck className="h-4 w-4 text-amber-700" />,
  business: <Store className="h-4 w-4 text-purple-700" />,
};

interface PartnersManagerProps {
  partners: Partner[];
}

export function PartnersManager({ partners }: PartnersManagerProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedType, setSelectedType] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState<PartnerType>("collection_point");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("القاهرة");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [capacityKg, setCapacityKg] = useState("1000");
  const [workingHours, setWorkingHours] = useState("");
  const [notes, setNotes] = useState("");

  const filteredPartners = partners.filter((p) => {
    if (selectedType === "all") return true;
    return p.type === selectedType;
  });

  const openCreateModal = () => {
    setEditingPartner(null);
    setName("");
    setNameAr("");
    setType("collection_point");
    setPhone("");
    setEmail("");
    setAddress("");
    setCity("القاهرة");
    setGovernorate("القاهرة");
    setCapacityKg("1000");
    setWorkingHours("يومياً من 9 صباحاً حتى 5 مساءً");
    setNotes("");
    setModalOpen(true);
  };

  const openEditModal = (p: Partner) => {
    setEditingPartner(p);
    setName(p.name);
    setNameAr(p.name_ar);
    setType(p.type);
    setPhone(p.phone || "");
    setEmail(p.email || "");
    setAddress(p.address);
    setCity(p.city);
    setGovernorate(p.governorate);
    setCapacityKg(p.capacity_kg?.toString() || "1000");
    setWorkingHours(p.working_hours || "");
    setNotes(p.notes || "");
    setModalOpen(true);
  };

  const handleSavePartner = () => {
    if (!nameAr.trim() || !address.trim()) {
      toast.error("يرجى إدخال اسم الشريك بالعربية والعنوان.");
      return;
    }

    startTransition(async () => {
      const res = await upsertPartnerAdminAction({
        id: editingPartner?.id,
        name: name.trim() || nameAr.trim(),
        name_ar: nameAr.trim(),
        type,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim() || "القاهرة",
        governorate: governorate.trim() || "القاهرة",
        capacity_kg: Number(capacityKg) || 1000,
        working_hours: workingHours.trim() || undefined,
        notes: notes.trim() || undefined,
        status: editingPartner ? editingPartner.status : "active",
      });

      if (!res.success) {
        toast.error("فشل حفظ الشريك", { description: res.error });
        return;
      }

      toast.success("تم حفظ بيانات الشريك بنجاح!");
      setModalOpen(false);
    });
  };

  const handleToggleStatus = (p: Partner) => {
    const nextStatus: PartnerStatus = p.status === "active" ? "inactive" : "active";
    startTransition(async () => {
      const res = await togglePartnerStatusAdminAction(p.id, nextStatus);
      if (!res.success) {
        toast.error("فشل التحديث", { description: res.error });
        return;
      }
      toast.success(`تم تغيير حالة الشريك إلى (${nextStatus === "active" ? "نشط" : "متوقف"}) بنجاح.`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Type Filter Tabs & Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedType === "all"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            الكل ({partners.length})
          </button>

          {(["collection_point", "transport", "recycler", "business"] as PartnerType[]).map((t) => {
            const count = partners.filter((p) => p.type === t).length;
            const isSelected = selectedType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {TYPE_ICONS[t]}
                <span>{PARTNER_TYPE_LABELS_AR[t]?.label.split(" ")[0]} ({count})</span>
              </button>
            );
          })}
        </div>

        <Button onClick={openCreateModal} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold gap-1.5 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          إضافة شريك جديد
        </Button>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-muted/10">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-sm">لا يوجد شركاء في هذا التصنيف</h3>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPartners.map((p) => {
            const statusBadge = PARTNER_STATUS_LABELS_AR[p.status] || {
              label: p.status,
              badgeVariant: "secondary" as const,
            };

            return (
              <Card key={p.id} className="p-4 flex flex-col justify-between hover:border-amber-300 transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] gap-1 bg-muted/30">
                      {TYPE_ICONS[p.type]}
                      <span>{PARTNER_TYPE_LABELS_AR[p.type]?.label.split(" ")[0]}</span>
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Badge variant={statusBadge.badgeVariant} className="text-[10px]">
                        {statusBadge.label}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleToggleStatus(p)}
                        title={p.status === "active" ? "تعطيل الشريك" : "تفعيل الشريك"}
                      >
                        <Power className={`h-3 w-3 ${p.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`} />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground">{p.name_ar}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{p.name}</p>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{p.governorate} — {p.address}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span dir="ltr" className="font-mono">{p.phone}</span>
                      </div>
                    )}
                    {p.working_hours && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded">
                        <Clock className="h-3 w-3 text-amber-700 shrink-0" />
                        <span>{p.working_hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    السعة: {p.capacity_kg} كجم
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(p)} className="text-xs h-7 gap-1">
                    <Edit className="h-3 w-3" />
                    تعديل
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Partner Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingPartner ? "تعديل بيانات الشريك" : "إضافة شريك أو نقطة تجميع جديدة"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              تسجيل بيانات مصانع التدوير، أساطيل النقل، أو مراكز التجميع.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">نوع الشريك *</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PartnerType)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="collection_point">نقطة تجميع وفروع تسليم</option>
                  <option value="transport">شركة نقل ولوجستيات</option>
                  <option value="recycler">مصنع صهر وتدوير معتمد</option>
                  <option value="business">شريك تجاري وصيانة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">المحافظة *</Label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">اسم الشريك بالعربية *</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: نقطة تجميع المعادي"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">رقم الهاتف للتواصل</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">السعة الاستيعابية (كجم)</Label>
                <Input
                  type="number"
                  value={capacityKg}
                  onChange={(e) => setCapacityKg(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">العنوان بالتفصيل *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع، المنطقة، علامة مميزة"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">مواعيد وساعات العمل</Label>
              <Input
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="يومياً من 9 صباحاً حتى 6 مساءً"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ملاحظات إضافية</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أنواع المخلفات المقبولة، معلومات الوصول..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isPending} className="text-xs">
              إلغاء
            </Button>
            <Button onClick={handleSavePartner} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الشريك"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
