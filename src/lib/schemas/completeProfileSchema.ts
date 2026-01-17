import { z } from "zod";
import { calculateAge } from "../util";

export const completeProfileWithPasswordSchema = z.object({
  name: z.string().min(3, {
    message: "השם חייב להיות באורך של לפחות 3 תווים",
  }),
  password: z.string().min(6, {
    message: "הסיסמה חייבת להיות באורך של לפחות 6 תווים",
  }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "בחר מגדר תקין: זכר או נקבה" }),
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
  email: z.string().email().optional(), // Allow email to pass through
});

export type CompleteProfileWithPasswordSchema = z.infer<
  typeof completeProfileWithPasswordSchema
>;
