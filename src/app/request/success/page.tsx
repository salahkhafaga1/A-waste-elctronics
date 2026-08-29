import Link from "next/link";
import { CheckCircle2, PackageCheck, LayoutDashboard, Plus, Truck, ArrowLeft, PhoneCall } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessPageProps {
  searchParams: {
    id?: string;
  };
}

export default function RequestSuccessPage({ searchParams }: SuccessPageProps) {
  const requestId = searchParams.id || "REQ-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <Shell>
      <div className="container py-16 max-w-2xl text-center">
        {/* Animated Check Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 mx-auto mb-6 shadow-sm ring-8 ring-emerald-50">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          تم استلام طلبك بنجاح!
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          شكراً لمساهمتك في حماية البيئة والتخلص الآمن من الأجهزة الإلكترونية القديمة.
        </p>

        {/* Request Reference Card */}
        <Card className="my-8 text-start border-emerald-200 bg-emerald-50/20 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-muted-foreground">رقم مرجع الطلب</CardTitle>
                <p className="text-base font-bold font-mono text-emerald-800 mt-0.5">{requestId}</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Truck className="h-3 w-3" />
                قيد المراجعة والتعيين
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">الخطوة القادمة:</strong>
                <p className="mt-0.5">
                  سيتواصل معك فريق العمليات أو مندوب الاستلام عبر الهاتف لتأكيد موعد الزيارة المناسب لك.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <PackageCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">الفحص وإضافة النقاط:</strong>
                <p className="mt-0.5">
                  يقوم المندوب بوزن الأجهزة وفحصها في مكانك، وتضاف النقاط المعتمدة فوراً إلى رصيد محفظتك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <LayoutDashboard className="h-4 w-4" />
              الذهاب إلى لوحة التحكم
            </Button>
          </Link>
          <Link href="/request">
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء طلب جمع آخر
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  );
}
