import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { getAllUsersAdmin } from "@/lib/supabase/admin-queries";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  const users = await getAllUsersAdmin();

  return (
    <Shell>
      <div className="space-y-6">
        <AdminNav />

        <div className="container py-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                إدارة المستخدمين والأدوار
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                دليل المستخدمين المسجلين، ومتابعة أرصدة النقاط، وتعيين وإلغاء الصلاحيات الإدارية.
              </p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              إجمالي المستخدمين ({users.length})
            </div>
          </div>

          <UsersManager users={users} />
        </div>
      </div>
    </Shell>
  );
}
