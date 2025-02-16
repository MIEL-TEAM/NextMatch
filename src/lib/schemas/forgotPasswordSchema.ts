import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "הסיסמה חייבת להכיל לפחות 6 תווים",
    }),
    confirmPassword: z.string().min(6, {
      message: "יש לאשר את הסיסמה עם לפחות 6 תווים",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
