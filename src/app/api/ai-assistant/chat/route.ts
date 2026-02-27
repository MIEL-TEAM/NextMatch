import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { getSmartMatches } from "@/app/actions/smartMatchActions";
import {
  getUserBehaviorInsights,
  analyzeMatchReason,
} from "@/lib/ai-assistant-helpers";
import { checkAndIncrementAIQuota } from "@/lib/aiQuota";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TEMP DEBUG — remove after identity verified stable
    // Confirms that userId (= token.sub) is consistent across logout/login.
    // If this value changes between sessions for the same user, a ghost
    // User row is being created (duplicate identity bug).
    console.log("AUTH DEBUG", { userId });

    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const [user, member] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          isPremium: true,
          premiumUntil: true,
          preferredGenders: true,
          preferredAgeMin: true,
          preferredAgeMax: true,
        },
      }),
      prisma.member.findUnique({
        where: { userId },
        include: {
          interests: { select: { name: true } },
        },
      }),
    ]);

    if (!user || !member) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Debug: confirm fresh DB values are reaching the quota engine
    console.log("[AI route premium check]", {
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      now: new Date(),
      comparison: user.premiumUntil && user.premiumUntil > new Date(),
    });

    const quota = await checkAndIncrementAIQuota(userId, user);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "AI_QUOTA_REACHED", remaining: 0, limit: quota.limit },
        { status: 429 }
      );
    }

    let conversation = await prisma.aIConversation.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: "שיחה חדשה",
        },
      });
    }

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const userAge =
      new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    const interests =
      member.interests?.map((i) => i.name).join(", ") || "לא צוינו";

    // Get comprehensive user insights
    const behaviorInsights = await getUserBehaviorInsights(userId);

    const intent = analyzeIntent(message);

    const systemPrompt = `אתה עוזר אישי לדייטים ב-Miel, אפליקציית ההיכרויות הישראלית המתקדמת בעולם.

פרופיל המשתמש:
- שם: ${user.name || "משתמש"}
- גיל: ${userAge}
- עיר: ${member.city}
- תחומי עניין: ${interests}

העדפות חיפוש:
- מגדר מועדף: ${user.preferredGenders || "male,female"}
- טווח גילאים: ${user.preferredAgeMin || 18}-${user.preferredAgeMax || 100}

📊 ניתוח התנהגות המשתמש (נתונים אמיתיים):
- סה"כ לייקים שניתנו: ${behaviorInsights.totalLikes}
- סה"כ הודעות שנשלחו: ${behaviorInsights.totalMessages}
- צפיות בפרופילים: ${behaviorInsights.totalViews}
- רמת פעילות: ${behaviorInsights.activityLevel === "high" ? "גבוהה מאוד" : behaviorInsights.activityLevel === "medium" ? "בינונית" : "נמוכה"}
- טווח גילאים מועדף (לפי התנהגות): ${behaviorInsights.preferredAgeRange[0]}-${behaviorInsights.preferredAgeRange[1]}
- ערים מועדפות: ${behaviorInsights.preferredCities.join(", ") || "אין נתונים"}
- תחומי עניין מועדפים: ${behaviorInsights.preferredInterests.join(", ") || "אין נתונים"}
- תכונות אישיות שזיהינו: ${behaviorInsights.personalityTraits.join(", ") || "עדיין לא מספיק נתונים"}
- אחוז הצלחה: ${Math.round(behaviorInsights.successRate)}%

המטרה שלך:
1. עזור למשתמש למצוא אהבה אמיתית - אתה מאמן דייטים אישי שלו
2. תן המלצות מבוססות נתונים אמיתיים מההיסטוריה שלו
3. היה חם, אמפתי, ומעודד - אבל גם ישיר וכן
4. דבר בעברית פשוטה וידידותית, כמו חבר טוב
5. היה ספציפי - השתמש בשם ובנתונים אמיתיים תמיד
6. תשובות קצרות וממוקדות - אל תכתוב יותר מ-150 מילים

כללים חשובים:
- אם המשתמש מבקש למצוא התאמות: ענה "מעולה ${user.name}! אני מחפש התאמות מושלמות בשבילך..." והמשך עם המלצות ספציפיות
- אם המשתמש רוצה פתיח לשיחה: תן 3 דוגמאות מקוריות, לא קלישאות
- אם המשתמש שואל על שיפור פרופיל: השתמש ב-recommendations מהניתוח
- אם המשתמש שואל "איך אני מתקדם": תן נתונים סטטיסטיים אמיתיים ממה שיש לך
- אם מדובר בשאלה על אדם ספציפי (שם): נסה לעזור עם מידע מהמערכת
- היה תמיד אופטימי אבל גם מציאותי - אל תשקר!

💡 טיפ חשוב: אם יש לך recommendations בניתוח - תמיד הזכיר אותם כשזה רלוונטי!`;

    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [{ role: "system", content: systemPrompt }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-10).forEach((msg: Message) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    messages.push({ role: "user", content: message });

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const duration = Date.now() - startTime;
    const assistantMessage =
      completion.choices[0].message.content || "מצטער, לא הצלחתי לענות.";
    const tokensUsed = completion.usage?.total_tokens || 0;

    const metadata: any = {};

    // Handle different intents with specific actions
    if (intent === "find_matches") {
      try {
        const matches = await getSmartMatches();
        if (matches.items.length > 0) {
          metadata.matches = await Promise.all(
            matches.items.slice(0, 3).map(async (m) => {
              const age =
                new Date().getFullYear() -
                new Date(m.dateOfBirth).getFullYear();

              // Get detailed match reason
              const detailedReason = await analyzeMatchReason(userId, m.userId);

              return {
                userId: m.userId,
                name: m.name,
                age,
                city: m.city,
                matchScore: m.matchScore,
                reason: detailedReason,
              };
            }),
          );
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    } else if (intent === "progress_analysis") {
      // Add detailed statistics to metadata
      metadata.stats = {
        totalLikes: behaviorInsights.totalLikes,
        totalMessages: behaviorInsights.totalMessages,
        totalViews: behaviorInsights.totalViews,
        activityLevel: behaviorInsights.activityLevel,
        successRate: Math.round(behaviorInsights.successRate),
        recommendations: behaviorInsights.recommendations,
      };
    } else if (intent === "improve_profile") {
      // Add specific recommendations
      metadata.recommendations = behaviorInsights.recommendations;
    }

    // Save assistant message
    const savedMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantMessage,
        metadata: metadata,
        tokensUsed,
      },
    });

    // Log usage
    await prisma.aIUsageLog.create({
      data: {
        userId,
        action: "chat",
        tokens: tokensUsed,
      },
    });

    // Update conversation
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    console.log(
      `✅ AI Chat: ${user.name} - ${duration}ms - ${tokensUsed} tokens`,
    );

    return NextResponse.json({
      messageId: savedMessage.id,
      content: assistantMessage,
      metadata,
      tokensUsed,
      remaining: quota.remaining,
      limit: quota.limit,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Find matches
  if (
    lowerMessage.includes("מצא") ||
    lowerMessage.includes("חפש") ||
    lowerMessage.includes("התאמ") ||
    lowerMessage.includes("מישהי") ||
    lowerMessage.includes("מישהו") ||
    lowerMessage.includes("מי מתאים")
  ) {
    return "find_matches";
  }

  // Ice breaker - check if asking about specific person
  if (
    lowerMessage.includes("פתיח") ||
    lowerMessage.includes("איך לפתוח") ||
    lowerMessage.includes("מה להגיד") ||
    lowerMessage.includes("שיחה עם") ||
    lowerMessage.includes("לכתוב ל")
  ) {
    return "ice_breaker";
  }

  // Profile improvement
  if (
    lowerMessage.includes("שפר") ||
    lowerMessage.includes("לשפר") ||
    lowerMessage.includes("פרופיל") ||
    lowerMessage.includes("טיפ") ||
    lowerMessage.includes("עצה")
  ) {
    return "improve_profile";
  }

  // Progress analysis
  if (
    lowerMessage.includes("איך אני") ||
    lowerMessage.includes("התקדמות") ||
    lowerMessage.includes("סטטיסטיקה") ||
    lowerMessage.includes("כמה") ||
    lowerMessage.includes("מצב")
  ) {
    return "progress_analysis";
  }

  // Why specific match
  if (
    lowerMessage.includes("למה") &&
    (lowerMessage.includes("התאמה") ||
      lowerMessage.includes("מתאים") ||
      lowerMessage.includes("לייק"))
  ) {
    return "explain_match";
  }

  // Dating advice
  if (
    lowerMessage.includes("דייט") ||
    lowerMessage.includes("פגישה") ||
    lowerMessage.includes("מה לעשות") ||
    lowerMessage.includes("איפה ל")
  ) {
    return "dating_advice";
  }

  return "general";
}
