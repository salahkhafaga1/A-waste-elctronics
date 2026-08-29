import { z } from "zod";

export const requestItemInputSchema = z.object({
  waste_item_id: z.string().min(1, "يرجى اختيار نوع الجهاز"),
  item_name: z.string().min(1, "اسم الجهاز مطلوب"),
  quantity: z.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  weight: z.number().min(0.01, "الوزن التقديري يجب أن يكون أكبر من 0"),
  condition: z.enum(["working", "broken", "scrap"], {
    errorMap: () => ({ message: "يرجى تحديد حالة الجهاز بشكل صحيح" }),
  }),
  image_url: z.string().optional().nullable(),
});

export const collectionRequestInputSchema = z.object({
  items: z
    .array(requestItemInputSchema)
    .min(1, "يجب إضافة جهاز أو قطعة واحدة على الأقل لطلب الجمع"),
  address: z
    .string()
    .min(5, "يرجى كتابة العنوان التفصيلي (الشارع، رقم المبنى، الشقة)")
    .max(250, "العنوان طويل جداً"),
  governorate: z.string().min(2, "يرجى اختيار المحافظة"),
  city: z.string().min(2, "يرجى كتابة اسم المدينة أو الحي"),
  phone: z
    .string()
    .regex(/^(01[0125][0-9]{8}|\+201[0125][0-9]{8})$/, {
      message: "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)",
    }),
  notes: z.string().max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف").optional().nullable(),
  images: z.array(z.string()).optional(),
});

export type RequestItemInput = z.infer<typeof requestItemInputSchema>;
export type CollectionRequestInput = z.infer<typeof collectionRequestInputSchema>;
