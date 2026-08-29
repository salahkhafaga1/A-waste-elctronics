"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { collectionRequestInputSchema, type CollectionRequestInput } from "@/lib/validations/request";
import { createCollectionRequestInDb, type FullCollectionRequest } from "@/lib/supabase/requests";
import { getWasteItems } from "@/lib/supabase/catalog";
import { syncUserProfile } from "@/lib/supabase/profiles";

export interface CreateRequestResponse {
  success: boolean;
  requestId?: string;
  data?: FullCollectionRequest;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createCollectionRequestServerAction(
  input: CollectionRequestInput
): Promise<CreateRequestResponse> {
  const { userId } = auth();

  if (!userId) {
    return {
      success: false,
      error: "يجب تسجيل الدخول أولاً لإرسال طلب جمع المخلفات.",
    };
  }

  // 1. Validate payload with Zod
  const validationResult = collectionRequestInputSchema.safeParse(input);
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      error: "بيانات الطلب غير مكتملة، يرجى مراجعة الحقول المطلوبة.",
      fieldErrors,
    };
  }

  const data = validationResult.data;

  // 2. Fetch catalog to recalculate verified points server-side
  const catalogItems = await getWasteItems();
  const catalogMap = new Map(catalogItems.map((item) => [item.id, item]));

  let totalCalculatedWeight = 0;
  let totalEstimatedPoints = 0;

  const itemsForDb = data.items.map((itemInput) => {
    const catalogItem = catalogMap.get(itemInput.waste_item_id);
    const itemName = catalogItem ? catalogItem.name_ar : itemInput.item_name;
    const pointsPerKg = catalogItem ? catalogItem.points_per_kg : 150;

    const itemTotalWeight = itemInput.weight * itemInput.quantity;
    const itemCalculatedPoints = Math.round(itemTotalWeight * pointsPerKg);

    totalCalculatedWeight += itemTotalWeight;
    totalEstimatedPoints += itemCalculatedPoints;

    return {
      waste_item_id: itemInput.waste_item_id,
      item_name: itemName,
      quantity: itemInput.quantity,
      weight: itemTotalWeight,
      condition: itemInput.condition,
      image_url: itemInput.image_url || null,
    };
  });

  // 3. Ensure profile is synced
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      await syncUserProfile({
        clerkUserId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
        phone: data.phone,
      });
    }
  } catch (err) {
    console.warn("Profile sync warning during request creation:", err);
  }

  // 4. Save collection request in database
  try {
    const fullRequest = await createCollectionRequestInDb(
      {
        user_id: userId,
        status: "pending",
        address: data.address,
        city: data.city,
        governorate: data.governorate,
        phone: data.phone,
        notes: data.notes || null,
        estimated_weight: Number(totalCalculatedWeight.toFixed(2)),
        estimated_points: totalEstimatedPoints,
      },
      itemsForDb
    );

    // 5. Revalidate cache
    revalidatePath("/dashboard");
    revalidatePath("/requests");

    return {
      success: true,
      requestId: fullRequest.id,
      data: fullRequest,
    };
  } catch (error) {
    console.error("Error creating request in server action:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء حفظ الطلب في قاعدة البيانات. يرجى المحاولة مرة أخرى.",
    };
  }
}
