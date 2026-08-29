"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations/profile";
import { updateUserProfile, getProfileByClerkId } from "@/lib/supabase/profiles";
import type { Profile } from "@/types/database";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfileServerAction(
  input: ProfileUpdateInput
): Promise<ActionResponse<Profile>> {
  const { userId } = auth();

  if (!userId) {
    return {
      success: false,
      error: "يجب تسجيل الدخول أولاً لتعديل البيانات الشخصية.",
    };
  }

  // 1. Validate payload with Zod
  const validationResult = profileUpdateSchema.safeParse(input);
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      error: "بيانات الإدخال غير صحيحة، يرجى مراجعة الحقول.",
      fieldErrors,
    };
  }

  const validatedData = validationResult.data;

  // 2. Perform safe update on Supabase (guarded against privileged fields)
  try {
    const result = await updateUserProfile(userId, {
      full_name: validatedData.full_name,
      phone: validatedData.phone,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || "تعذر تحديث البيانات في قاعدة البيانات.",
      };
    }

    // 3. Revalidate dashboard caches
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Profile update server action error:", error);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء حفظ التعديلات.",
    };
  }
}

export async function getProfileServerAction(): Promise<ActionResponse<Profile>> {
  const { userId } = auth();

  if (!userId) {
    return {
      success: false,
      error: "غير مصرح.",
    };
  }

  try {
    const profile = await getProfileByClerkId(userId);
    if (!profile) {
      return {
        success: false,
        error: "لم يتم العثور على الملف الشخصي.",
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    return {
      success: false,
      error: "تعذر جلب بيانات الملف الشخصي.",
    };
  }
}
