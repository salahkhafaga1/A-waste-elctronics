"use client";

import React, { useTransition } from "react";
import { toast } from "sonner";
import { User, Phone, Mail, Shield, Coins, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateProfileServerAction } from "@/app/actions/profile";
import { ROLE_LABELS_AR } from "@/constants/roles";
import { formatPoints } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  initialProfile: Profile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = React.useState(initialProfile.full_name || "");
  const [phone, setPhone] = React.useState(initialProfile.phone || "");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const response = await updateProfileServerAction({
        full_name: fullName.trim(),
        phone: phone.trim() ? phone.trim() : null,
      });

      if (!response.success) {
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
        toast.error("تعذر تحديث الملف الشخصي", {
          description: response.error || "يرجى التأكد من صحة البيانات المدخلة.",
        });
        return;
      }

      toast.success("تم تحديث البيانات بنجاح", {
        description: "تم حفظ بياناتك الشخصية في قاعدة البيانات.",
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">البيانات الشخصية</CardTitle>
          <CardDescription>
            قم بتحديث اسمك ورقم هاتفك لتسهيل التواصل عند طلبات جمع المخلفات الإلكترونية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-1.5 font-semibold">
              <User className="h-4 w-4 text-emerald-600" />
              الاسم بالكامل
            </Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="مثال: أحمد محمد علي"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isPending}
              className={fieldErrors.full_name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {fieldErrors.full_name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {fieldErrors.full_name[0]}
              </p>
            )}
          </div>

          {/* Egyptian Phone Number */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="flex items-center gap-1.5 font-semibold">
                <Phone className="h-4 w-4 text-emerald-600" />
                رقم الهاتف المصري
              </Label>
              <span className="text-[11px] text-muted-foreground">صيغة: 01012345678 أو +201...</span>
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              dir="ltr"
              className={fieldErrors.phone ? "border-destructive focus-visible:ring-destructive text-start font-mono" : "text-start font-mono"}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="flex items-center gap-1.5 font-semibold">
                <Mail className="h-4 w-4 text-muted-foreground" />
                البريد الإلكتروني المسجل
              </Label>
              <span className="text-[11px] text-muted-foreground">(يُدار عبر حسابك في Clerk)</span>
            </div>
            <Input
              id="email"
              value={initialProfile.email}
              disabled
              readOnly
              className="bg-muted/50 text-muted-foreground cursor-not-allowed font-mono text-xs"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/10 py-4">
          <Button type="submit" disabled={isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التعديلات
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Account Permissions & Immutable Fields Card */}
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">معلومات وصلاحيات الحساب المحمية</CardTitle>
          </div>
          <CardDescription className="text-xs">
            هذه الحقول محمية أمنياً على مستوى الخادم وقاعدة البيانات ولا يمكن تعديلها يدوياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              صلاحية الحساب:
            </span>
            <Badge variant="secondary">
              {ROLE_LABELS_AR[initialProfile.role]}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-600" />
              رصيد النقاط المكتسبة:
            </span>
            <span className="font-bold text-emerald-700 font-mono">
              {formatPoints(initialProfile.points_balance)} نقطة
            </span>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
