"use server";

import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/clerk/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Partner,
  PartnerType,
  PartnerStatus,
  PickupStatus,
} from "@/types/database";

async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error("غير مصرح لك بتنفيذ هذه العملية الإدارية.");
  }
}

export async function upsertPartnerAdminAction(partnerData: {
  id?: string;
  name: string;
  name_ar: string;
  type: PartnerType;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  governorate: string;
  status?: PartnerStatus;
  capacity_kg?: number;
  working_hours?: string;
  notes?: string;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const payload = {
      name: partnerData.name,
      name_ar: partnerData.name_ar,
      type: partnerData.type,
      phone: partnerData.phone || null,
      email: partnerData.email || null,
      address: partnerData.address,
      city: partnerData.city || "القاهرة",
      governorate: partnerData.governorate || "القاهرة",
      status: partnerData.status || "active",
      capacity_kg: partnerData.capacity_kg || 1000,
      working_hours: partnerData.working_hours || null,
      notes: partnerData.notes || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (partnerData.id) {
      const res = await supabase.from("partners").update(payload).eq("id", partnerData.id);
      error = res.error;
    } else {
      const res = await supabase.from("partners").insert({
        ...payload,
        id: crypto.randomUUID(),
      });
      error = res.error;
    }

    if (error) {
      return { success: false, error: `فشل حفظ بيانات الشريك: ${error.message}` };
    }

    revalidatePath("/admin/partners");
    revalidatePath("/collection-points");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء حفظ الشريك." };
  }
}

export async function togglePartnerStatusAdminAction(
  partnerId: string,
  newStatus: PartnerStatus
) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("partners")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", partnerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/partners");
    revalidatePath("/collection-points");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function assignPartnerToRequestAdminAction(params: {
  requestId: string;
  partnerId: string;
  scheduledAt?: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const assignmentPayload = {
      request_id: params.requestId,
      partner_id: params.partnerId,
      assigned_at: new Date().toISOString(),
      scheduled_at: params.scheduledAt ? new Date(params.scheduledAt).toISOString() : null,
      status: params.scheduledAt ? "scheduled" : "assigned",
      driver_name: params.driverName || null,
      driver_phone: params.driverPhone || null,
      notes: params.notes || null,
      updated_at: new Date().toISOString(),
    };

    // Check if an assignment already exists for this request
    const { data: existing } = await supabase
      .from("pickup_assignments")
      .select("id")
      .eq("request_id", params.requestId)
      .single();

    let assignError;
    if (existing) {
      const res = await supabase
        .from("pickup_assignments")
        .update(assignmentPayload)
        .eq("id", existing.id);
      assignError = res.error;
    } else {
      const res = await supabase
        .from("pickup_assignments")
        .insert({
          ...assignmentPayload,
          id: crypto.randomUUID(),
        });
      assignError = res.error;
    }

    if (assignError) {
      return { success: false, error: `فشل تعيين الشريك: ${assignError.message}` };
    }

    // Automatically advance collection request status to assigned if currently pending
    await supabase
      .from("collection_requests")
      .update({
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.requestId)
      .in("status", ["pending", "confirmed"]);

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${params.requestId}`);
    revalidatePath(`/requests/${params.requestId}`);
    revalidatePath("/requests");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء إسناد الشريك للطلب." };
  }
}

export async function updatePickupStatusAdminAction(params: {
  assignmentId: string;
  requestId: string;
  newStatus: PickupStatus;
  notes?: string;
}) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error: assignError } = await supabase
      .from("pickup_assignments")
      .update({
        status: params.newStatus,
        notes: params.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.assignmentId);

    if (assignError) {
      return { success: false, error: `فشل تحديث حالة الاستلام: ${assignError.message}` };
    }

    // If pickup completed, advance collection request to collected
    if (params.newStatus === "completed") {
      await supabase
        .from("collection_requests")
        .update({
          status: "collected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.requestId);
    }

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${params.requestId}`);
    revalidatePath(`/requests/${params.requestId}`);
    revalidatePath("/requests");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء تحديث حالة الاستلام." };
  }
}
