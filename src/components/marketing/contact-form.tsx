"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EGYPTIAN_GOVERNORATES } from "@/constants/waste";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [inquiryType, setInquiryType] = useState("individual");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية.");
      return;
    }

    startTransition(async () => {
      // Simulate submission network response
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
      toast.success("تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا قريباً.");
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-2xl border border-emerald-300 bg-emerald-50/40 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-base text-foreground">شكراً لتواصلك معنا!</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          تم استلام استفسارك بنجاح وسيقوم أحد ممثلي خدمة العملاء بالرد عليك عبر الهاتف أو البريد الإلكتروني خلال ٢٤ ساعة.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsSubmitted(false);
            setMessage("");
          }}
          className="text-xs mt-2"
        >
          إرسال رسالة أخرى
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cName" className="text-xs font-semibold">
            الاسم بالكامل *
          </Label>
          <Input
            id="cName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: محمد علي"
            className="text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cPhone" className="text-xs font-semibold">
            رقم الهاتف للتواصل *
          </Label>
          <Input
            id="cPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01012345678"
            className="text-xs font-mono"
            dir="ltr"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cEmail" className="text-xs font-semibold">
            البريد الإلكتروني
          </Label>
          <Input
            id="cEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="text-xs font-mono"
            dir="ltr"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cGov" className="text-xs font-semibold">
            المحافظة
          </Label>
          <select
            id="cGov"
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
        <Label htmlFor="cType" className="text-xs font-semibold">
          نوع الطلب أو الاستفسار *
        </Label>
        <select
          id="cType"
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="individual">استفسار أفراد (طلب جمع منزلي / نقاط / مكافآت)</option>
          <option value="corporate">شراكة شركات ومؤسسات (كميات كبيرة / شهادات تدوير)</option>
          <option value="partner">طلب الانضمام كشريك تجميع أو أسطول نقل</option>
          <option value="feedback">اقتراح أو شكوى</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cMsg" className="text-xs font-semibold">
          تفاصيل الرسالة أو الاستفسار *
        </Label>
        <Textarea
          id="cMsg"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب تفاصيل استفسارك أو بيانات الأجهزة والكميات..."
          className="text-xs"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2 h-10 shadow-sm"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        إرسال الرسالة
      </Button>
    </form>
  );
}
