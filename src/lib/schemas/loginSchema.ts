import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "אימייל לא תקין",
  }),
  password: z.string().min(6, {
    message: "הסיסמה חייבת להיות באורך של לפחות 6 תווים",
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
