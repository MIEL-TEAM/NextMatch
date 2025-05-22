import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import {
  getUserLikes,
  getUserMessages,
  getUserInteractions,
} from "../smartMatchActions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeUserBehaviorWithAI(
  userId: string,
  options?: { forceRefresh?: boolean }
) {
  const existing = await prisma.userProfileAnalysis.findUnique({
    where: { userId },
  });

  const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

  if (!options?.forceRefresh && existing && existing.updatedAt > oneDayAgo) {
    console.log("🧊 שימוש ב־cache");
    return existing.content;
  }

  const likes = await getUserLikes(userId);
  const messages = await getUserMessages(userId);
  const interactions = await getUserInteractions(userId);

  const prompt = `
המערכת צריכה להבין את דפוס ההעדפות של משתמש לפי ההתנהגות שלו:

🔸 לייקים:
${likes
  .map((l, i) => {
    const interestsText =
      l.interests?.map((int) => int.name).join(", ") || "לא צוינו";
    return `${i + 1}. גיל: ${l.dateOfBirth}, עיר: ${l.city}, תחומי עניין: ${interestsText}`;
  })
  .join("\n")}

🔸 הודעות שנשלחו:
${
  messages.length > 0
    ? messages.map((m, i) => `${i + 1}. "${m.text}"`).join("\n")
    : "לא נשלחו הודעות"
}

🔸 אינטראקציות עם פרופילים:
${
  interactions.length > 0
    ? interactions
        .map(
          (it, i) =>
            `${i + 1}. ${it.action} עם ${it.targetName}, זמן שהייה: ${it.duration} שניות`
        )
        .join("\n")
    : "אין אינטראקציות רשומות"
}

בהתבסס על זה, בנה תיאור קצר של העדפות המשתמש (מה מושך אותו, מה פחות) בפורמט הבא:
- העדפות כלליות
- נושאים שנראים חשובים לו
- טיפוסי אנשים שמתאימים לו
- המלצות להתאמות
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  const result = completion.choices[0].message.content;
  console.log(
    "🔥 נשלחה קריאה אמיתית ל־GPT | tokens estimated:",
    prompt.length + (result?.length || 0)
  );

  const safeResult = result ?? "לא התקבל ניתוח מהבינה המלאכותית";

  await prisma.userProfileAnalysis.upsert({
    where: { userId },
    update: { content: safeResult },
    create: {
      userId,
      content: safeResult,
    },
  });

  console.log("✅ ניתוח חדש נשמר ל־userId:", userId);
  return result;
}
