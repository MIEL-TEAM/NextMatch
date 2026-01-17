import { z } from "zod";

export const minimalRegisterSchema = z.object({
  email: z.string().email({
    message: "אימייל לא תקין",
  }),
});

export type MinimalRegisterSchema = z.infer<typeof minimalRegisterSchema>;
