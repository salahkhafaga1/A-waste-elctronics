import { z } from "zod";

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "الاسم الكامل يجب أن يتكون من حرفين على الأقل" })
    .max(100, { message: "الاسم الكامل طويل جداً" })
    .optional(),
  phone: z
    .string()
    .regex(/^(01[0125][0-9]{8}|\+201[0125][0-9]{8})$/, {
      message: "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)",
    })
    .optional()
    .nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
