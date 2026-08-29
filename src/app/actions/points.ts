"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { awardPointsForVerifiedRequest, getUserPointsLedger, getUserPointsSummary } from "@/lib/supabase/points";
import { checkIsAdmin } from "@/lib/clerk/roles";

export async function awardVerifiedRequestPointsAction(params: {
  requestId: string;
  verifiedWeight: number;
  finalPoints: number;
  adminNotes?: string;
}) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء." };
  }

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "هذه العملية مخصصة للإدارة وفرق الفحص المعتمدة فقط." };
  }

  const result = await awardPointsForVerifiedRequest(params);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/requests");
    revalidatePath(`/requests/${params.requestId}`);
    revalidatePath("/points");
    revalidatePath("/admin");
  }

  return result;
}

export async function getUserPointsSummaryAction() {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "يجب تسجيل الدخول أولاً." };
  }

  const summary = await getUserPointsSummary(userId);
  return { success: true, summary };
}
