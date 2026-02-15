import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import {
  dbGetUserLikesWithDetails,
  dbGetUserMessagesWithDetails,
  dbGetMessageRecipients,
  dbGetUserInteractionsWithDetails,
} from "@/lib/db/smartMatchActions";
import { PremiumAnalysisResult } from "@/types/smart-matches";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });



export async function analyzeUserBehaviorWithPremiumAI(
  userId: string,
  options?: { forceRefresh?: boolean }
): Promise<PremiumAnalysisResult> {
  const existing = await prisma.userProfileAnalysis.findUnique({
    where: { userId },
  });

  const sixHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 6);

  if (!options?.forceRefresh && existing && existing.updatedAt > sixHoursAgo) {
    return {
      content: existing.content,
      insights: JSON.parse(existing.insights || "{}"),
    };
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
        interests: { select: { name: true, category: true } },
        description: true,
        gender: true,
        name: true,
      },
    }),
  ]);

  // Enhanced data analysis
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
      acc.totalWeight = (acc.totalWeight || 0) + interaction.weight;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate behavior patterns
  const behaviorPatterns = analyzeBehaviorPatterns(
    interactions,
    likes.length,
    messages.length
  );

  // Enhanced messaging analysis
  const messagingAnalysis = analyzeMessagingPatterns(messages);

  const premiumPrompt = `
אתה מומחה בפסיכולוגיה של היכרויות ובניתוח התנהגות דיגיטלית ברמה מקצועית. המשימה שלך היא לספק ניתוח מקיף ומדויק שיוביל להתאמות טובות יותר.

## 👤 פרופיל המשתמש:
- שם: ${userProfile?.name || "לא צוין"}
- גיל: ${userProfile?.dateOfBirth ? new Date().getFullYear() - new Date(userProfile.dateOfBirth).getFullYear() : "לא צוין"}
- עיר: ${userProfile?.city || "לא צוין"}
- מגדר: ${userProfile?.gender || "לא צוין"}
- תחומי עניין: ${userProfile?.interests?.map((int) => int.name).join(", ") || "לא צוינו"}
- תיאור עצמי: ${userProfile?.description || "לא צוין"}

## 📊 נתוני התנהגות מתקדמים:

### ניתוח לייקים (${likes.length} לייקים):
${likes.length > 0
      ? likes
        .slice(0, 10)
        .map((l, i) => {
          const age =
            new Date().getFullYear() - new Date(l.dateOfBirth).getFullYear();
          const interestsText =
            l.interests?.map((int: { name: string }) => int.name).join(", ") ||
            "לא צוינו";
          return `${i + 1}. גיל: ${age}, עיר: ${l.city || "לא צוין"}, מגדר: ${l.gender || "לא צוין"}, תחומי עניין: ${interestsText}`;
        })
        .join("\n")
      : "לא ניתנו לייקים עדיין"
    }

### ניתוח הודעות (${messages.length} הודעות):
${messages.length > 0
      ? messages
        .slice(0, 5)
        .map(
          (m, i) =>
            `${i + 1}. "${m.text.substring(0, 100)}..." (אורך: ${m.text.length} תווים) - אל: ${m.recipientName}`
        )
        .join("\n")
      : "לא נשלחו הודעות"
    }

סגנון הודעות: ${messagingAnalysis.style}
אורך ממוצע: ${messagingAnalysis.averageLength} תווים
תדירות שליחה: ${messagingAnalysis.frequency}

### ניתוח אינטראקציות (${interactions.length} אינטראקציות):
${Object.entries(interactionStats)
      .filter(([key]) => key !== "totalWeight")
      .map(([action, count]) => `- ${action}: ${count} פעמים`)
      .join("\n")}
משקל אינטראקציות כולל: ${interactionStats.totalWeight || 0}

### דפוסי התנהגות:
- רמת מעורבות: ${behaviorPatterns.engagementLevel}
- סגנון חיפוש: ${behaviorPatterns.searchStyle}
- עקביות בהעדפות: ${behaviorPatterns.consistency}

## 📈 ניתוח סטטיסטי מתקדם:
- טווח גילאים: ${ageRanges.length > 0 ? `${Math.min(...ageRanges)}-${Math.max(...ageRanges)} (ממוצע: ${Math.round(ageRanges.reduce((a, b) => a + b, 0) / ageRanges.length)})` : "לא מספיק נתונים"}
- פיזור גיאוגרפי: ${cities.length > 0 ? [...new Set(cities)].slice(0, 3).join(", ") : "לא מספיק נתונים"}
- תחומי עניין פופולריים: ${interests.length > 0 ? [...new Set(interests)].slice(0, 5).join(", ") : "לא מספיק נתונים"}

## 🎯 בקש ניתוח מקצועי ומדויק:

ספק ניתוח מקיף בפורמט הבא:

### 🔍 פרופיל אישיותי:
- תכונות אישיות דומיננטיות (בהתבסס על התנהגות)
- סגנון תקשורת ויצירת קשר
- רמת פתיחות לחוויות חדשות
- גישה לזמן ולמחויבות

### 💎 העדפות ברורות:
- טווח גילאים מועדף (עם אחוזי ביטחון)
- העדפות גיאוגרפיות (קרבה vs גיוון)
- תחומי עניין קריטיים vs נחמדים
- סוג אישיות מועדף (אקטיבי/רגוע/אינטלקטואלי וכו')

### 🚀 אסטרטגיות התאמה:
- איך למצוא התאמות איכותיות
- סוגי פרופילים שכדאי להימנע מהם
- נקודות חוזק בפרופיל הנוכחי
- שיפורים מומלצים

### 📊 רמת ביטחון:
- אחוז דיוק הניתוח (בהתבסס על ${likes.length + messages.length + interactions.length} נקודות נתונים)
- איזה נתונים חסרים לשיפור הדיוק
- המלצות לאיסוף מידע נוסף

**חשוב מאוד:** 
- בסס הכל על נתונים אמיתיים, לא על הנחות
- אם יש מעט נתונים, ציין בבירור את המגבלות
- תן ציונים כמותיים איפה שאפשר
- היה ספציפי ופרקטי, לא כללי
`;

  try {
    console.log("🚀 שולח בקשה ל-GPT-4o-mini...");
    const startTime = Date.now();

    const completion = (await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini", // החלפה למודל מהיר יותר
        messages: [{ role: "user", content: premiumPrompt }],
        temperature: 0.3, // קצת יותר מהיר
        max_tokens: 1500, // פחות טוקנים = מהיר יותר
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("AI timeout after 30 seconds")),
          30000
        )
      ),
    ])) as any;

    const duration = Date.now() - startTime;
    console.log(`⚡ GPT-4o-mini הגיב תוך ${duration}ms`);

    const result = completion.choices[0].message.content;
    console.log("🔥 Premium AI analysis completed for user:", userId);

    // Extract insights for structured data
    const insights = extractStructuredInsights(result || "", {
      dataPoints: likes.length + messages.length + interactions.length,
      behaviorPatterns,
      messagingAnalysis,
    });

    const safeResult = result ?? "לא התקבל ניתוח מהבינה המלאכותית";

    await prisma.userProfileAnalysis.upsert({
      where: { userId },
      update: {
        content: safeResult,
        insights: JSON.stringify(insights),
      },
      create: {
        userId,
        content: safeResult,
        insights: JSON.stringify(insights),
      },
    });

    return {
      content: safeResult,
      insights,
    };
  } catch (error) {
    console.error("Premium AI analysis error:", error);
    return {
      content:
        "לא ניתן לקבל ניתוח מהבינה המלאכותית כרגע. אנא נסה שוב מאוחר יותר.",
      insights: {
        confidenceScore: 0,
        primaryTraits: [],
        compatibilityFactors: [],
        recommendedImprovements: [],
      },
    };
  }
}

function analyzeBehaviorPatterns(
  interactions: any[],
  likesCount: number,
  messagesCount: number
) {
  const totalInteractions = interactions.length;
  const avgWeight =
    totalInteractions > 0
      ? interactions.reduce((sum, i) => sum + i.weight, 0) / totalInteractions
      : 0;

  let engagementLevel = "נמוכה";
  if (avgWeight > 2) engagementLevel = "גבוהה";
  else if (avgWeight > 1.5) engagementLevel = "בינונית";

  let searchStyle = "סלקטיבי";
  if (likesCount > 50) searchStyle = "פעיל";
  else if (likesCount < 10) searchStyle = "זהיר";

  let consistency = "בינונית";
  if (messagesCount > likesCount * 0.3) consistency = "גבוהה";
  else if (messagesCount < likesCount * 0.1) consistency = "נמוכה";

  return {
    engagementLevel,
    searchStyle,
    consistency,
  };
}

function analyzeMessagingPatterns(messages: any[]) {
  if (messages.length === 0) {
    return {
      style: "לא ידוע",
      averageLength: 0,
      frequency: "לא פעיל",
    };
  }

  const totalLength = messages.reduce(
    (sum, m) => sum + (m.text?.length || 0),
    0
  );
  const averageLength = Math.round(totalLength / messages.length);

  let style = "קצר";
  if (averageLength > 150) style = "מפורט";
  else if (averageLength > 80) style = "בינוני";

  let frequency = "בינונית";
  if (messages.length > 30) frequency = "גבוהה";
  else if (messages.length < 10) frequency = "נמוכה";

  return {
    style,
    averageLength,
    frequency,
  };
}

function extractStructuredInsights(
  analysisText: string,
  metadata: {
    dataPoints: number;
    behaviorPatterns: any;
    messagingAnalysis: any;
  }
): {
  confidenceScore: number;
  primaryTraits: string[];
  compatibilityFactors: string[];
  recommendedImprovements: string[];
} {
  // Calculate confidence score based on data availability
  let confidenceScore = Math.min(metadata.dataPoints * 2, 100);
  if (metadata.dataPoints < 10) confidenceScore = Math.max(confidenceScore, 30);

  // Extract traits from analysis (simple keyword matching)
  const traits = [];
  if (
    analysisText.includes("פעיל") ||
    metadata.behaviorPatterns.engagementLevel === "גבוהה"
  ) {
    traits.push("פעיל חברתית");
  }
  if (
    analysisText.includes("סלקטיבי") ||
    metadata.behaviorPatterns.searchStyle === "זהיר"
  ) {
    traits.push("בררן");
  }
  if (metadata.messagingAnalysis.style === "מפורט") {
    traits.push("מתקשר טוב");
  }

  const compatibilityFactors = [
    "התאמת גיל",
    "קרבה גיאוגרפית",
    "תחומי עניין משותפים",
    "סגנון תקשורת",
  ];

  const improvements = [];
  if (metadata.dataPoints < 20) {
    improvements.push("הגדל פעילות לשיפור הדיוק");
  }
  if (metadata.behaviorPatterns.consistency === "נמוכה") {
    improvements.push("היה עקבי יותר בהעדפות");
  }

  return {
    confidenceScore,
    primaryTraits: traits,
    compatibilityFactors,
    recommendedImprovements: improvements,
  };
}

export async function getUserLikes(userId: string) {
  const targetUsers = await dbGetUserLikesWithDetails(userId);
  return targetUsers.map((user) => ({
    name: user.name || "משתמש",
    gender: user.gender || "לא צוין",
    city: user.city || "לא צוין",
    dateOfBirth: user.dateOfBirth || new Date(),
    interests: user.interests || [],
  }));
}

export async function getUserMessages(userId: string) {
  const messages = await dbGetUserMessagesWithDetails(userId);
  const recipients = await dbGetMessageRecipients(
    messages.map((m) => m.recipientId).filter(Boolean) as string[]
  );

  return messages.map((message) => ({
    text: message.text,
    recipientName: message.recipient?.name || "משתמש",
    recipientGender:
      recipients.find((r) => r.userId === message.recipientId)?.gender ||
      "לא צוין",
  }));
}

export async function getUserInteractions(userId: string) {
  const interactions = await dbGetUserInteractionsWithDetails(userId);

  return interactions.map((i) => ({
    targetName: i.target?.name || "משתמש",
    targetGender: i.target?.gender || "לא צוין",
    targetCity: i.target?.city || "לא צוין",
    targetAge: i.target?.dateOfBirth
      ? new Date().getFullYear() - new Date(i.target.dateOfBirth).getFullYear()
      : null,
    duration: i.duration || 0,
    action: i.action,
    timestamp: i.timestamp,
    weight: i.weight || 1.0,
  }));
}
