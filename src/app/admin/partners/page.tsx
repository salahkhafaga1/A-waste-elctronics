import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAllPartners } from "@/lib/supabase/partners";
import { PartnersManager } from "@/components/admin/partners-manager";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const partners = await getAllPartners();

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                إدارة الشركاء والعمليات اللوجستية
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                ربط المنصة بمصانع التدوير المعتمدة، وأساطيل النقل، ونقاط التجميع بالجامعات والمراكز التجارية.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              إجمالي الشركاء النشطين: <strong>{partners.length}</strong>
            </div>
          </div>

          <PartnersManager partners={partners} />
        </div>
      </div>
    </Shell>
  );
}
