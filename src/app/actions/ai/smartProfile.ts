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
    return existing.content;
  }

  const [likes, messages, interactions, userProfile] = await Promise.all([
    getUserLikes(userId),
    getUserMessages(userId),
    getUserInteractions(userId),
    prisma.member.findUnique({
      where: { userId },
      select: {
        dateOfBirth: true,
        city: true,
        interests: { select: { name: true } },
        description: true,
        gender: true,
      },
    }),
  ]);

  const ageRanges = likes.map((like) => {
    const age =
      new Date().getFullYear() - new Date(like.dateOfBirth).getFullYear();
    return age;
  });

  const cities = likes.map((like) => like.city).filter(Boolean);
  const interests = likes.flatMap(
    (like) => like.interests?.map((int: { name: string }) => int.name) || []
  );

  const interactionStats = interactions.reduce(
    (acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const prompt = `
אתה מומחה בניתוח התנהגות משתמשים באפליקציות היכרויות. עליך לנתח את הנתונים הבאים ולספק ניתוח מדויק ומפורט:

## 📊 נתוני המשתמש הנוכחי:
- גיל: ${userProfile?.dateOfBirth ? new Date().getFullYear() - new Date(userProfile.dateOfBirth).getFullYear() : "לא צוין"}
- עיר: ${userProfile?.city || "לא צוין"}
- מגדר: ${userProfile?.gender || "לא צוין"}
- תחומי עניין: ${userProfile?.interests?.map((int) => int.name).join(", ") || "לא צוינו"}
- תיאור: ${userProfile?.description || "לא צוין"}

## 🔍 נתוני התנהגות:

### לייקים שניתנו (${likes.length}):
${
  likes.length > 0
    ? likes
        .map((l, i) => {
          const age =
            new Date().getFullYear() - new Date(l.dateOfBirth).getFullYear();
          const interestsText =
            l.interests?.map((int: { name: string }) => int.name).join(", ") ||
            "לא צוינו";
          const categories =
            l.interests
              ?.map((int: { category: string | null }) => int.category)
              .filter((cat): cat is string => cat !== null)
              .join(", ") || "לא צוינו";
          return `${i + 1}. גיל: ${age}, עיר: ${l.city || "לא צוין"}, מגדר: ${l.gender || "לא צוין"}, תחומי עניין: ${interestsText}${categories !== "לא צוינו" ? ` (קטגוריות: ${categories})` : ""}`;
        })
        .join("\n")
    : "לא ניתנו לייקים עדיין"
}

### הודעות שנשלחו (${messages.length}):
${messages.length > 0 ? messages.map((m, i) => `${i + 1}. "${m.text}" (${new Date(m.created).toLocaleDateString("he-IL")}) - למ: ${m.recipientName} (${m.recipientGender})`).join("\n") : "לא נשלחו הודעות"}

### אינטראקציות עם פרופילים (${interactions.length}):
${interactions.length > 0 ? interactions.map((it, i) => `${i + 1}. ${it.action} עם ${it.targetName} (${it.targetGender}, ${it.targetAge ? `${it.targetAge} שנים` : "גיל לא ידוע"}, ${it.targetCity || "עיר לא ידועה"}), זמן שהייה: ${it.duration} שניות, משקל: ${it.weight}`).join("\n") : "אין אינטראקציות רשומות"}

### סטטיסטיקות אינטראקציות:
${Object.entries(interactionStats)
  .map(([action, count]) => `- ${action}: ${count} פעמים`)
  .join("\n")}

## 📈 ניתוח סטטיסטי:
- טווח גילאים מועדף: ${ageRanges.length > 0 ? `${Math.min(...ageRanges)}-${Math.max(...ageRanges)}` : "לא מספיק נתונים"}
- ערים מועדפות: ${cities.length > 0 ? [...new Set(cities)].slice(0, 3).join(", ") : "לא מספיק נתונים"}
- תחומי עניין נפוצים: ${interests.length > 0 ? [...new Set(interests)].slice(0, 5).join(", ") : "לא מספיק נתונים"}
- מגדרים מועדפים: ${likes.length > 0 ? [...new Set(likes.map((l) => l.gender).filter(Boolean))].join(", ") : "לא מספיק נתונים"}

## 🎯 משימה:
תבסס על הנתונים לעיל, ספק ניתוח מדויק ומפורט בפורמט הבא:

### העדפות כלליות:
- טווח גילאים מועדף (עם אחוזי דיוק)
- העדפות גיאוגרפיות (ערים/מדינות)
- תחומי עניין מועדפים (עם קטגוריות)
- העדפות מגדר
- סגנון תקשורת (תבסס על הודעות)

### נושאים חשובים:
- קריטריונים עיקריים בבחירת בן/בת זוג
- ערכים חשובים (מהתיאור והתנהגות)
- סגנון חיים מועדף
- רמת מעורבות (תבסס על משקלי אינטראקציות)

### טיפוסי אנשים מתאימים:
- פרופיל אישיותי
- רקע מקצועי/חינוכי
- סגנון חיים
- רמת פעילות חברתית

### המלצות להתאמות:
- שיפורים לפרופיל (תבסס על דפוסי התנהגות)
- אסטרטגיות היכרות (תבסס על הודעות מוצלחות)
- נקודות לשיפור
- תחומי עניין לחקירה

### רמת ביטחון בניתוח:
- אחוזי דיוק (תבסס על כמות הנתונים: ${likes.length + messages.length + interactions.length} נקודות נתונים)
- המלצות לאיסוף נתונים נוספים
- מגבלות הניתוח הנוכחי

**חשוב:** השתמש בנתונים הסטטיסטיים והתבסס על דפוסים אמיתיים מהנתונים. אם אין מספיק נתונים, ציין זאת בבירור. תן עדיפות לנתונים כמותיים על פני ניחושים.
`;

  const completion = await openai.chat.completions
    .create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    })
    .catch((error) => {
      console.error("OpenAI API Error:", error);
      return {
        choices: [
          {
            message: {
              content:
                "לא ניתן לקבל ניתוח מהבינה המלאכותית כרגע. אנא נסה שוב מאוחר יותר.",
            },
          },
        ],
      };
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

  return result;
}
