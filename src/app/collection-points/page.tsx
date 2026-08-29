import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Building2,
  Recycle,
  Search,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCollectionPoints } from "@/lib/supabase/partners";
import { EGYPTIAN_GOVERNORATES } from "@/constants/waste";

export const dynamic = "force-dynamic";

interface CollectionPointsPageProps {
  searchParams?: {
    governorate?: string;
  };
}

export default async function CollectionPointsPage({ searchParams }: CollectionPointsPageProps) {
  const currentGov = searchParams?.governorate || "all";
  const points = await getCollectionPoints(currentGov === "all" ? undefined : currentGov);

  return (
    <Shell>
      <div className="container py-10 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>شبكة الفروع ومراكز التسليم المباشر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              نقاط تجميع المخلفات الإلكترونية
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              سلّم أجهزتك الإلكترونية القديمة بنفسك في أقرب نقطة تجميع بالجامعات، المراكز التجارية، ومراكز الشركاء.
            </p>
          </div>

          <Link href="/request">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-xs font-bold">
              <PlusCircle className="h-4 w-4" />
              طلب استلام من المنزل
            </Button>
          </Link>
        </div>

        {/* Governorate Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
          <Link
            href="/collection-points"
            className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
              currentGov === "all"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            جميع المحافظات ({points.length})
          </Link>

          {["القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "المنوفية"].map((gov) => {
            const isSelected = currentGov === gov;
            return (
              <Link
                key={gov}
                href={`/collection-points?governorate=${gov}`}
                className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {gov}
              </Link>
            );
          })}
        </div>

        {/* Collection Points Grid */}
        {points.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-muted/10">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-base">لا توجد نقاط تجميع مسجلة في هذه المحافظة حالياً</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              يمكنك طلب مندوب شحن لاستلام الأجهزة مباشرة من باب منزلك في أي محافظة.
            </p>
            <Link href="/request">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                طلب استلام منزلي
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {points.map((pt) => (
              <Card
                key={pt.id}
                className="overflow-hidden border hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-50 border-emerald-300 text-emerald-900">
                      {pt.governorate}
                    </Badge>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      فرع معتمد
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold mt-2">
                    {pt.name_ar}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {pt.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-foreground font-medium">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt.address}</span>
                  </div>

                  {pt.working_hours && (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      <span>{pt.working_hours}</span>
                    </div>
                  )}

                  {pt.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>هاتف المركز: <strong dir="ltr" className="font-mono text-foreground">{pt.phone}</strong></span>
                    </div>
                  )}

                  {pt.notes && (
                    <p className="text-[11px] text-muted-foreground pt-1 border-t italic">
                      {pt.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
