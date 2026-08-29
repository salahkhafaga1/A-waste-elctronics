"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redeemRewardInDb } from "@/lib/supabase/rewards";

export async function redeemRewardServerAction(
  rewardId: string,
  metadata?: Record<string, any>
) {
  const { userId } = auth();

  if (!userId) {
    return {
      success: false,
      error: "يجب تسجيل الدخول أولاً لإتمام عملية استبدال المكافأة.",
    };
  }

  if (!rewardId) {
    return {
      success: false,
      error: "معرف المكافأة غير صحيح.",
    };
  }

  const result = await redeemRewardInDb({
    userId,
    rewardId,
    metadata,
  });

  if (result.success) {
    revalidatePath("/rewards");
    revalidatePath("/rewards/history");
    revalidatePath("/rewards/my-vouchers");
    revalidatePath("/points");
    revalidatePath("/dashboard");
  }

  return result;
}
