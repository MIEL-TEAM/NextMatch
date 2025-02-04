import { z } from "zod";

export const messagesSchema = z.object({
  text: z.string().min(1, {
    message: "היי, אל תשכח לכתוב משהו 😉",
  }),
});

export type MessageSchema = z.infer<typeof messagesSchema>;
