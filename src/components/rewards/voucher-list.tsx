"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Ticket,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ShoppingBag,
  Clock,
  Wallet,
  Trees,
  HeartHandshake,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REDEMPTION_STATUS_LABELS_AR, REWARD_CATEGORY_LABELS_AR } from "@/constants/rewards";
import { formatPoints } from "@/lib/utils";
import type { Redemption, RewardCategory } from "@/types/database";

interface VoucherListProps {
  vouchers: Redemption[];
}

export function VoucherList({ vouchers }: VoucherListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("تم نسخ الرمز بنجاح!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filterType === "all") return true;
    const cat = v.reward?.category || v.metadata?.reward_category;
    return cat === filterType;
  });

  if (vouchers.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center bg-muted/10">
        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-bold text-base">لا توجد مكافآت مستبدلة بعد</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          يمكنك تحويل نقاطك إلى كاش مباشر، أو زراعة شجرة بيئية، أو التبرع لمستشفى 57357، أو قسائم شراء نون وأمازون.
        </p>
        <Link href="/rewards">
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <ShoppingBag className="h-4 w-4" />
            تصفح متجر المكافآت
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            filterType === "all"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>الكل ({vouchers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType("cash")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            filterType === "cash"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>
            سحب كاش ({vouchers.filter((v) => (v.reward?.category || v.metadata?.reward_category) === "cash").length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType("tree")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            filterType === "tree"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trees className="h-3.5 w-3.5" />
          <span>
            أشجار بيئية ({vouchers.filter((v) => (v.reward?.category || v.metadata?.reward_category) === "tree").length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType("donation")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            filterType === "donation"
              ? "bg-rose-600 text-white border-rose-600 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          <span>
            تبرعات 57357 ({vouchers.filter((v) => (v.reward?.category || v.metadata?.reward_category) === "donation").length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType("voucher")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            filterType === "voucher"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>
            قسائم تسوق ({vouchers.filter((v) => (v.reward?.category || v.metadata?.reward_category) === "voucher").length})
          </span>
        </button>
      </div>

      {filteredVouchers.length === 0 ? (
        <Card className="border-dashed p-8 text-center bg-muted/10">
          <p className="text-xs text-muted-foreground">لا توجد عمليات في هذا التصنيف</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVouchers.map((v) => {
            const isCopied = copiedId === v.id;
            const category = v.reward?.category || v.metadata?.reward_category || "voucher";
            const isExpired = new Date(v.expires_at) < new Date() && v.status !== "used";
            const displayStatus = isExpired ? "expired" : v.status;
            const statusInfo = REDEMPTION_STATUS_LABELS_AR[displayStatus] || {
              label: displayStatus,
              badgeVariant: "secondary" as const,
            };

            return (
              <Card
                key={v.id}
                className="overflow-hidden border hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {category === "cash" ? (
                        <Badge variant="outline" className="text-[11px] font-semibold border-amber-300 text-amber-900 bg-amber-50 gap-1">
                          <Wallet className="h-3 w-3" />
                          تحويل نقدي
                        </Badge>
                      ) : category === "tree" ? (
                        <Badge variant="outline" className="text-[11px] font-semibold border-emerald-300 text-emerald-900 bg-emerald-50 gap-1">
                          <Trees className="h-3 w-3" />
                          زراعة شجرة
                        </Badge>
                      ) : category === "donation" ? (
                        <Badge variant="outline" className="text-[11px] font-semibold border-rose-300 text-rose-900 bg-rose-50 gap-1">
                          <HeartHandshake className="h-3 w-3" />
                          تبرع 57357
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] font-semibold gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {v.reward?.partner_name || "قسيمة شراء"}
                        </Badge>
                      )}
                    </div>

                    <Badge variant={statusInfo.badgeVariant} className="text-[10px]">
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold mt-2">
                    {v.reward?.title_ar || v.metadata?.reward_title || "مكافأة إعادة التدوير"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Category-Specific Box */}
                  {category === "cash" ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-900 font-bold">المبلغ المستحق:</span>
                        <strong className="text-base font-mono font-bold text-amber-950">
                          {v.reward?.monetary_value || v.metadata?.monetary_value || "50"} جنيه مصري
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-amber-700" />
                          رقم المحفظة / الحساب:
                        </span>
                        <span className="font-mono font-bold text-foreground" dir="ltr">
                          {v.metadata?.payout_phone || "مسجل لدى الإدارة"}
                        </span>
                      </div>
                      {v.metadata?.payout_account_name && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-amber-700" />
                            اسم المستلم:
                          </span>
                          <span className="font-medium text-foreground">
                            {v.metadata.payout_account_name}
                          </span>
                        </div>
                      )}
                      <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800">
                        <span>رقم الطلب المرجعي:</span>
                        <code className="font-mono font-bold">{v.voucher_code}</code>
                      </div>
                    </div>
                  ) : category === "tree" ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-900 font-bold flex items-center gap-1">
                          <Trees className="h-4 w-4 text-emerald-700" />
                          شهادة غرس بيئية معتمدة
                        </span>
                        <Badge className="bg-emerald-700 text-white text-[10px]">مكتمل</Badge>
                      </div>
                      {v.metadata?.dedication_name && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>مسجلة باسم:</span>
                          <strong className="text-emerald-950 font-bold">
                            {v.metadata.dedication_name}
                          </strong>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80">
                        <span className="text-muted-foreground">رقم الشهادة:</span>
                        <code className="font-mono font-bold text-emerald-900">{v.voucher_code}</code>
                      </div>
                    </div>
                  ) : category === "donation" ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-900 font-bold flex items-center gap-1">
                          <HeartHandshake className="h-4 w-4 text-rose-600" />
                          إيصال تبرع مستشفى 57357
                        </span>
                        <strong className="text-rose-700 font-bold font-mono">
                          {v.reward?.monetary_value || v.metadata?.monetary_value || "50"} ج.م
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>اسم المتبرع:</span>
                        <span className="font-medium text-foreground">
                          {v.metadata?.donor_name || "فاعل خير"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                        <span className="text-muted-foreground">رقم الإيصال:</span>
                        <code className="font-mono font-bold text-rose-950">{v.voucher_code}</code>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-center space-y-1.5">
                      <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                        رمز القسيمة / Coupon Code
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-base sm:text-lg font-black font-mono tracking-widest text-emerald-950 select-all">
                          {v.voucher_code}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => handleCopy(v.id, v.voucher_code)}
                          title="نسخ الرمز"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expiry & Points info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      تاريخ الاستبدال: {new Date(v.created_at).toLocaleDateString("ar-EG")}
                    </span>
                    <span>
                      النقاط: <strong className="font-mono text-foreground">{formatPoints(v.points_spent)}</strong>
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t bg-muted/5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {category === "cash"
                      ? "تحويل مباشر للمحفظة"
                      : category === "tree"
                      ? "مبادرة شجرها ومصر الخضراء"
                      : category === "donation"
                      ? "مستشفى سرطان الأطفال 57357"
                      : `صالحة حتى: ${new Date(v.expires_at).toLocaleDateString("ar-EG")}`}
                  </span>
                  <span className="text-emerald-700 font-medium">
                    {category === "cash" && v.status === "pending"
                      ? "جاري المراجعة"
                      : "معتمد ورسمي"}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
