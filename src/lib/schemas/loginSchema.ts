import { z } from "zod";

// loginSchema: Defines the validation rules with Zod.
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

// LoginSchema: Infers a TypeScript type from loginSchema for type safety.
export type LoginSchema = z.infer<typeof loginSchema>;
