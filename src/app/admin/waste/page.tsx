import { redirect } from "next/navigation";
import { Recycle } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { checkIsAdmin } from "@/lib/clerk/roles";
import {
  getAllWasteCategoriesAdmin,
  getAllWasteItemsAdmin,
} from "@/lib/supabase/admin-queries";
import { WasteCatalogManager } from "@/components/admin/waste-catalog-manager";

export const dynamic = "force-dynamic";

export default async function AdminWasteCatalogPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const [categories, items] = await Promise.all([
    getAllWasteCategoriesAdmin(),
    getAllWasteItemsAdmin(),
  ]);

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                دليل وتسعير المخلفات الإلكترونية
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                إدارة تصنيفات الأجهزة الإلكترونية وقواعد احتساب النقاط التقديرية والتسعير للكيلوجرام.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              التصنيفات ({categories.length}) • العناصر ({items.length})
            </div>
          </div>

          <WasteCatalogManager categories={categories} items={items} />
        </div>
      </div>
    </Shell>
  );
}
