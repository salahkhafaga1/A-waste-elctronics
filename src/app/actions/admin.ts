"use server";

import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPointsTransaction } from "@/lib/supabase/points";
import type {
  RequestStatus,
  RedemptionStatus,
  UserRole,
  WasteCategory,
  WasteItem,
  Reward,
  RewardCategory,
} from "@/types/database";

// Helper guard for server actions
async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error("غير مصرح لك بتنفيذ هذه العملية الإدارية.");
  }
}

/**
 * Update request status (e.g. pending -> confirmed -> assigned -> collected -> recycled)
 */
export async function updateRequestStatusAdminAction(
  requestId: string,
  newStatus: RequestStatus,
  notes?: string
) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updatePayload.notes = notes;
    }

    const { data, error } = await supabase
      .from("collection_requests")
      .update(updatePayload)
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      return { success: false, error: `فشل تحديث حالة الطلب: ${error.message}` };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/requests");
    revalidatePath(`/requests/${requestId}`);

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء تحديث حالة الطلب." };
  }
}

/**
 * Verify weight and award final verified points to user wallet
 */
export async function verifyRequestAndAwardPointsAdminAction(params: {
  requestId: string;
  verifiedWeight: number;
  finalPoints: number;
  notes?: string;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // 1. Fetch current request
    const { data: request, error: reqError } = await supabase
      .from("collection_requests")
      .select("*")
      .eq("id", params.requestId)
      .single();

    if (reqError || !request) {
      return { success: false, error: "لم يتم العثور على طلب الجمع المطلوب." };
    }

    // 2. Prevent duplicate awards if already verified with final points
    if (request.status === "verified" && request.final_points) {
      return { success: false, error: "تم اعتماد هذا الطلب وإضافة النقاط مسبقاً." };
    }

    // 3. Atomically update request to verified
    const { error: updateError } = await supabase
      .from("collection_requests")
      .update({
        status: "verified",
        verified_weight: params.verifiedWeight,
        final_points: params.finalPoints,
        notes: params.notes || request.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.requestId);

    if (updateError) {
      return { success: false, error: `فشل اعتماد الطلب: ${updateError.message}` };
    }

    // 4. Award final points to the user's ledger
    const txResult = await recordPointsTransaction({
      userId: request.user_id,
      requestId: request.id,
      type: "collection",
      points: params.finalPoints,
      description: `مكافأة معتمدة لطلب إعادة التدوير (${params.verifiedWeight} كجم)`,
    });

    if (!txResult.success) {
      console.error("Points award ledger error:", txResult.error);
      return {
        success: false,
        error: `تم تحديث الطلب ولكن حدث خطأ في إضافة النقاط للمحفظة: ${txResult.error}`,
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${params.requestId}`);
    revalidatePath("/requests");
    revalidatePath(`/requests/${params.requestId}`);
    revalidatePath("/points");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء اعتماد الطلب واحتساب النقاط." };
  }
}

/**
 * Update redemption status (Approve, Complete, Reject with points refund)
 */
export async function updateRedemptionStatusAdminAction(params: {
  redemptionId: string;
  newStatus: RedemptionStatus;
  notes?: string;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // 1. Fetch redemption
    const { data: redemption, error: redError } = await supabase
      .from("redemptions")
      .select("*, reward:rewards(*)")
      .eq("id", params.redemptionId)
      .single();

    if (redError || !redemption) {
      return { success: false, error: "لم يتم العثور على سجل المكافأة المطلوب." };
    }

    const previousStatus = redemption.status;

    // 2. If rejecting or cancelling a previously pending or approved redemption, refund points
    if (
      ["rejected", "cancelled"].includes(params.newStatus) &&
      ["pending", "approved"].includes(previousStatus)
    ) {
      const refundResult = await recordPointsTransaction({
        userId: redemption.user_id,
        type: "refund",
        points: redemption.points_spent,
        description: `استرداد نقاط لعملية استبدال ملغاة (${redemption.reward?.title_ar || "مكافأة"})`,
      });

      if (!refundResult.success) {
        return {
          success: false,
          error: `فشل استرداد النقاط لحساب المستخدم: ${refundResult.error}`,
        };
      }
    }

    // 3. Update redemption record
    const updatedMetadata = {
      ...(redemption.metadata || {}),
      admin_notes: params.notes || null,
      resolved_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("redemptions")
      .update({
        status: params.newStatus,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.redemptionId);

    if (updateError) {
      return { success: false, error: `فشل تحديث حالة المكافأة: ${updateError.message}` };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/redemptions");
    revalidatePath("/rewards/history");
    revalidatePath("/points");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء تحديث حالة المكافأة." };
  }
}

/**
 * Waste Categories CRUD
 */
export async function upsertWasteCategoryAdminAction(categoryData: {
  id?: string;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const payload = {
      name: categoryData.name,
      name_ar: categoryData.name_ar,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: categoryData.description || null,
      is_active: categoryData.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (categoryData.id) {
      const res = await supabase.from("waste_categories").update(payload).eq("id", categoryData.id);
      error = res.error;
    } else {
      const res = await supabase.from("waste_categories").insert({
        ...payload,
        id: crypto.randomUUID(),
      });
      error = res.error;
    }

    if (error) {
      return { success: false, error: `فشل حفظ تصنيف المخلفات: ${error.message}` };
    }

    revalidatePath("/admin/waste");
    revalidatePath("/request");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء حفظ التصنيف." };
  }
}

/**
 * Waste Items CRUD
 */
export async function upsertWasteItemAdminAction(itemData: {
  id?: string;
  category_id: string;
  name: string;
  name_ar: string;
  description?: string;
  points_per_kg: number;
  base_price: number;
  estimated_weight_kg?: number;
  is_active?: boolean;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const payload = {
      category_id: itemData.category_id,
      name: itemData.name,
      name_ar: itemData.name_ar,
      description: itemData.description || null,
      points_per_kg: itemData.points_per_kg,
      base_price: itemData.base_price,
      estimated_weight_kg: itemData.estimated_weight_kg || 0.5,
      is_active: itemData.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (itemData.id) {
      const res = await supabase.from("waste_items").update(payload).eq("id", itemData.id);
      error = res.error;
    } else {
      const res = await supabase.from("waste_items").insert({
        ...payload,
        id: crypto.randomUUID(),
      });
      error = res.error;
    }

    if (error) {
      return { success: false, error: `فشل حفظ عنصر المخلفات: ${error.message}` };
    }

    revalidatePath("/admin/waste");
    revalidatePath("/request");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء حفظ العنصر." };
  }
}

export async function toggleWasteItemActiveAdminAction(itemId: string, isActive: boolean) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("waste_items")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", itemId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/waste");
    revalidatePath("/request");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Rewards CRUD
 */
export async function upsertRewardAdminAction(rewardData: {
  id?: string;
  title: string;
  title_ar: string;
  description?: string;
  partner_name: string;
  category: RewardCategory;
  points_cost: number;
  monetary_value: number;
  stock_quantity: number;
  expiry_days: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const payload = {
      title: rewardData.title,
      title_ar: rewardData.title_ar,
      description: rewardData.description || null,
      partner_name: rewardData.partner_name,
      category: rewardData.category,
      points_cost: rewardData.points_cost,
      monetary_value: rewardData.monetary_value,
      stock_quantity: rewardData.stock_quantity,
      expiry_days: rewardData.expiry_days,
      is_active: rewardData.is_active ?? true,
      metadata: rewardData.metadata || {},
      updated_at: new Date().toISOString(),
    };

    let error;
    if (rewardData.id) {
      const res = await supabase.from("rewards").update(payload).eq("id", rewardData.id);
      error = res.error;
    } else {
      const res = await supabase.from("rewards").insert({
        ...payload,
        id: crypto.randomUUID(),
      });
      error = res.error;
    }

    if (error) {
      return { success: false, error: `فشل حفظ المكافأة: ${error.message}` };
    }

    revalidatePath("/admin/rewards");
    revalidatePath("/rewards");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء حفظ المكافأة." };
  }
}

export async function toggleRewardActiveAdminAction(rewardId: string, isActive: boolean) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("rewards")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", rewardId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/rewards");
    revalidatePath("/rewards");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * User Role Management
 */
export async function updateUserRoleAdminAction(targetUserId: string, newRole: UserRole) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", targetUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
