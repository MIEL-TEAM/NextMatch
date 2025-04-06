import { z } from "zod";
import { calculateAge } from "../util";

export const registerSchema = z.object({
  name: z.string().min(3, {
    message: "השם חייב להיות באורך של לפחות 3 תווים",
  }),
  email: z.string().email({
    message: "אימייל לא תקין",
  }),
  password: z.string().min(6, {
    message: "הסיסמה חייבת להיות באורך של לפחות 6 תווים",
  }),
});

export const profileSchema = z.object({
  gender: z.string().min(1, {
    message: "בחר מגדר בבקשה",
  }),
  description: z.string().min(1, {
    message: "ספר על עצמך בכמה מילים",
  }),
  city: z.string().min(1, {
    message: "ציין עיר מגורים",
  }),
  country: z.string().min(1, {
    message: "ציין מדינה",
  }),
  dateOfBirth: z
    .string()
    .min(1, {
      message: "נא להזין תאריך לידה",
    })
    .refine(
      (dataString) => {
        const age = calculateAge(new Date(dataString));
        return age >= 18;
      },
      {
        message: "עליך להיות לפחות בן 18 כדי להשתמש באפליקציה",
      }
    ),
  interests: z.array(z.string()).min(1, {
    message: "בחר לפחות תחום עניין אחד",
  }),
});

export const combinedRegisterSchema = registerSchema.and(profileSchema);

export type ProfileSchema = z.infer<typeof profileSchema>;

export type RegisterSchema = z.infer<
  typeof registerSchema & typeof profileSchema
>;
