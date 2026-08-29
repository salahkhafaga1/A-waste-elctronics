import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sparkles, Truck } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { RequestWizard } from "@/components/forms/request-wizard";
import { getWasteCategories, getWasteItems } from "@/lib/supabase/catalog";
import { getProfileByClerkId } from "@/lib/supabase/profiles";

export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login?redirect_url=/request");
  }

  // Fetch catalog & user profile
  const [categories, items, profile] = await Promise.all([
    getWasteCategories(),
    getWasteItems(),
    getProfileByClerkId(user.id),
  ]);

  const defaultPhone = profile?.phone || user.phoneNumbers?.[0]?.phoneNumber || "";
  const defaultFullName = profile?.full_name || `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <Shell>
      <div className="container py-10 max-w-4xl">
        {/* Header */}
        <div className="pb-6 border-b mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
            <Truck className="h-3.5 w-3.5" />
            <span>طلب جمع المخلفات الإلكترونية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            طلب تسليم أجهزة ومخلفات إلكترونية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            حدد أجهزتك التالفة أو القديمة، وسيتوجه مندوبنا المعتمد لاستلامها من باب منزلك مع احتساب النقاط التقديرية فوراً.
          </p>
        </div>

        {/* Wizard Form Component */}
        <RequestWizard
          categories={categories}
          items={items}
          defaultPhone={defaultPhone}
          defaultFullName={defaultFullName}
        />
      </div>
    </Shell>
  );
}
