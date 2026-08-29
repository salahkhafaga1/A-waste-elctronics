import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck, PlusCircle, ArrowLeft, Clock, MapPin, PackageCheck, Coins } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCollectionRequestsByUser } from "@/lib/supabase/requests";
import { REQUEST_STATUS_LABELS_AR } from "@/constants/waste";
import { formatPoints } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface RequestsPageProps {
  searchParams: {
    status?: string;
  };
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/login?redirect_url=/requests");
  }

  const allRequests = await getCollectionRequestsByUser(user.id);
  const currentFilter = searchParams.status || "all";

  const filteredRequests = allRequests.filter((req) => {
    if (currentFilter === "pending") return req.status === "pending";
    if (currentFilter === "active") return ["confirmed", "assigned", "collected"].includes(req.status);
    if (currentFilter === "completed") return ["verified", "recycled"].includes(req.status);
    if (currentFilter === "cancelled") return req.status === "cancelled";
    return true;
  });

  return (
    <Shell>
      <div className="container py-10 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
              <Truck className="h-3.5 w-3.5" />
              <span>متابعة الشحنات والطلبات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              طلبات جمع المخلفات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تتبع مسار طلباتك لحظة بلحظة واطلع على النقاط التقديرية والمعتمدة.
            </p>
          </div>

          <Link href="/request">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              طلب جمع جديد
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 text-xs font-semibold scrollbar-none">
          <Link href="/requests">
            <Button
              variant={currentFilter === "all" ? "default" : "outline"}
              size="sm"
              className={currentFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              الكل ({allRequests.length})
            </Button>
          </Link>
          <Link href="/requests?status=pending">
            <Button
              variant={currentFilter === "pending" ? "default" : "outline"}
              size="sm"
              className={currentFilter === "pending" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              قيد المراجعة ({allRequests.filter((r) => r.status === "pending").length})
            </Button>
          </Link>
          <Link href="/requests?status=active">
            <Button
              variant={currentFilter === "active" ? "default" : "outline"}
              size="sm"
              className={currentFilter === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              قيد الاستلام والتنفيذ ({allRequests.filter((r) => ["confirmed", "assigned", "collected"].includes(r.status)).length})
            </Button>
          </Link>
          <Link href="/requests?status=completed">
            <Button
              variant={currentFilter === "completed" ? "default" : "outline"}
              size="sm"
              className={currentFilter === "completed" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              تم الفحص والتدوير ({allRequests.filter((r) => ["verified", "recycled"].includes(r.status)).length})
            </Button>
          </Link>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed p-10 text-center bg-muted/10">
            <PackageCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-base">لا توجد طلبات في هذا التصنيف</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              يمكنك إنشاء طلب جمع جديد وسيقوم مندوبنا المعتمد بزيارتك لاستلام الأجهزة الإلكترونية.
            </p>
            <Link href="/request">
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4" />
                إنشاء طلب جمع
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => (
              <Card key={req.id} className="hover:border-emerald-300 hover:shadow-sm transition-all">
                <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-emerald-800">
                          #{req.id.slice(0, 8)}
                        </span>
                        <Badge
                          variant={
                            req.status === "verified" || req.status === "recycled"
                              ? "default"
                              : req.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {REQUEST_STATUS_LABELS_AR[req.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        تاريخ الطلب: {new Date(req.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <Link href={`/requests/${req.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      تتبع مسار الطلب
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="p-5 pt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{req.governorate} — {req.city} ({req.address})</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-semibold">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>الوزن التقديري:</span>
                        <strong className="text-foreground">{req.estimated_weight} كجم</strong>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <Coins className="h-3.5 w-3.5" />
                        <span>
                          {req.final_points !== null && req.final_points !== undefined
                            ? `${formatPoints(req.final_points)} نقطة معتمدة`
                            : `${formatPoints(req.estimated_points)} نقطة تقديرية`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {req.items && req.items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
                      <span className="text-muted-foreground">الأجهزة:</span>
                      {req.items.map((item) => (
                        <span
                          key={item.id}
                          className="bg-muted/60 px-2.5 py-0.5 rounded text-foreground font-medium"
                        >
                          {item.item_name} ({item.quantity})
                        </span>
                      ))}
                    </div>
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
