import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAllRewardsAdmin } from "@/lib/supabase/admin-queries";
import { RewardsManager } from "@/components/admin/rewards-manager";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const rewards = await getAllRewardsAdmin();

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                إدارة متجر المكافآت والشركاء
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                إضافة وتعديل قسائم الشركاء، وتحديد تكلفة النقاط، وإدارة عروض الكاش والتبرعات.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              إجمالي المكافآت ({rewards.length})
            </div>
          </div>

          <RewardsManager rewards={rewards} />
        </div>
      </div>
    </Shell>
  );
}
