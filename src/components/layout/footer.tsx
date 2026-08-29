import React from "react";
import Link from "next/link";
import {
  Recycle,
  Heart,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowUpLeft,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card text-muted-foreground mt-auto">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Recycle className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-start">
                <span className="font-extrabold tracking-tight leading-tight text-foreground">تدوير الإلكترونيات</span>
                <span className="text-[10px] text-muted-foreground font-normal">E-Waste Egypt Platform</span>
              </div>
            </Link>

            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              المنصة الرقمية الوطنية المعتمدة لإدارة وإعادة تدوير المخلفات والأجهزة الإلكترونية في جمهورية مصر العربية. تحويل الأجهزة القديمة إلى مكافآت فورية وأثر بيئي مستدام.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>متوافق مع معايير جهاز تنظيم إدارة المخلفات (WMRA)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-foreground">عن المنصة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors">
                  من نحن ورسالتنا
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-600 transition-colors">
                  كيف تعمل المنصة
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-emerald-600 transition-colors">
                  الأثر البيئي والاستدامة
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
                  قواعد النقاط والتسعير
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Operations */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-foreground">الخدمات والعمليات</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/request" className="hover:text-emerald-600 transition-colors">
                  طلب جمع منزلي
                </Link>
              </li>
              <li>
                <Link href="/collection-points" className="hover:text-emerald-600 transition-colors">
                  نقاط التجميع والفروع
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-emerald-600 transition-colors">
                  متجر المكافآت والكاش
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-600 transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-foreground">تواصل معنا</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span dir="ltr" className="font-mono">19450 / 01099887766</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono">contact@e-waste.eg</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>القرية الذكية، الجيزة، مصر</span>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline pt-1">
                  نموذج التواصل السريع
                  <ArrowUpLeft className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1 text-muted-foreground">
            صنع بكل <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> من أجل بيئة مصرية خضراء ومستدامة
          </p>

          <p className="text-muted-foreground">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} منصة تدوير المخلفات الإلكترونية بمصر
          </p>
        </div>
      </div>
    </footer>
  );
}
