import { z } from "zod";
import { calculateAge } from "../util";
import { availableInterests } from "../constants/interests";

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

  interests: z
    .array(z.string())
    .optional()
    .default([])
    .refine(
      (interests) =>
        interests.every((id) =>
          availableInterests.some((interest) => interest.id === id)
        ),
      {
        message: "תחומי עניין לא תקינים",
      }
    ),
});

// Add preferences schema
export const preferencesSchema = z
  .object({
    preferredGenders: z
      .union([z.array(z.enum(["male", "female"])), z.string()])
      .transform((val) => {
        if (Array.isArray(val)) {
          return val.join(",");
        }
        return val;
      })
      .pipe(
        z.string().min(1, {
          message: "בחר לפחות אפשרות אחת",
        })
      ),
    preferredAgeMin: z
      .number()
      .min(18, { message: "גיל מינימלי הוא 18" })
      .max(100, { message: "גיל מקסימלי הוא 100" })
      .default(18),
    preferredAgeMax: z
      .number()
      .min(18, { message: "גיל מינימלי הוא 18" })
      .max(100, { message: "גיל מקסימלי הוא 100" })
      .default(100),
  })
  .refine((data) => data.preferredAgeMax >= data.preferredAgeMin, {
    message: "גיל מקסימלי חייב להיות גדול או שווה לגיל המינימלי",
    path: ["preferredAgeMax"],
  });

// Add photo upload schema
export const photoSchema = z.object({
  photos: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
      })
    )
    .min(0, {
      message: "תמונות אופציונליות",
    })
    .max(3, {
      message: "ניתן להעלות עד 3 תמונות",
    })
    .default([]),
});

export const combinedRegisterSchema = registerSchema
  .merge(profileSchema)
  .merge(photoSchema)
  .and(preferencesSchema);

export type ProfileSchema = z.infer<typeof profileSchema>;
export type PreferencesSchema = z.infer<typeof preferencesSchema>;
export type PhotoSchema = z.infer<typeof photoSchema>;
export type RegisterSchema = z.infer<typeof combinedRegisterSchema>;
