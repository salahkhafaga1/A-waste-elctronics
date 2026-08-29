import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata = {
  title: "تواصل معنا والشراكات | منصة تدوير المخلفات الإلكترونية بمصر",
  description: "تواصل مع فريق خدمة العملاء، طلبات الشراكات للشركات والجامعات، ومراكز التجميع في مصر.",
};

export default function ContactPage() {
  return (
    <Shell>
      <div className="container py-12 md:py-16 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>نحن هنا للإجابة على جميع استفساراتك</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            تواصل مع فريق المنصة
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            سواء كنت فرداً ترغب في تسليم أجهزتك القديمة، أو شركة تبحث عن شراكة مستدامة مع شهادات تدوير معتمدة، يسعدنا تواصلك دائماً.
          </p>
        </div>

        {/* Form and Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Card (1 col) */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-foreground">قنوات الاتصال المباشرة</h3>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">الخط الساخن والدعم</span>
                    <span dir="ltr" className="font-mono block mt-0.5">19450 / 01099887766</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">البريد الإلكتروني</span>
                    <span className="font-mono block mt-0.5">support@e-waste.eg</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">مواعيد العمل</span>
                    <span className="block mt-0.5">السبت إلى الخميس: ٩:٠٠ ص - ٦:٠٠ م</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">المقر الرئيسي</span>
                    <span className="block mt-0.5">مبنى B12، القرية الذكية، الجيزة، مصر</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-muted/20 border text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                شراكات الشركات والجامعات
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                نوفر حلول تدوير متكاملة للشركات تشمل عقود شهرية، وحاويات تجميع، وتقارير استدامة بيئية (ESG).
              </p>
            </Card>
          </div>

          {/* Interactive Form Card (2 cols) */}
          <Card className="md:col-span-2 p-6 sm:p-8">
            <CardHeader className="p-0 pb-6 border-b mb-6">
              <CardTitle className="text-lg font-bold">أرسل استفسارك أو طلب الشراكة</CardTitle>
              <CardDescription className="text-xs">
                املأ النموذج التالي وسيقوم الفريق المختص بالتواصل معك في أقرب وقت.
              </CardDescription>
            </CardHeader>

            <ContactForm />
          </Card>
        </div>
      </div>
    </Shell>
  );
}
