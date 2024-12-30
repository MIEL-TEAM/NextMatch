import { z } from "zod";

export const memberEditSchema = z.object({
  name: z.string().min(1, {
    message: "אופס, שכחת להכניס שם!",
  }),
  description: z.string().min(1, {
    message: "אופס, שכחת להוסיף תיאור!",
  }),
  city: z.string().min(1, {
    message: "אופס, שכחת להוסיף עיר לפרופיל שלך!",
  }),
  country: z.string().min(1, {
    message: "אופס, שכחת לבחור מדינה!",
  }),
});

export type MemberEditSchema = z.infer<typeof memberEditSchema>;
