import { prisma } from "@/lib/prisma";

interface UserBehaviorInsights {
  totalLikes: number;
  totalMessages: number;
  totalViews: number;
  averageResponseTime: number;
  preferredAgeRange: [number, number];
  preferredCities: string[];
  preferredInterests: string[];
  activityLevel: "low" | "medium" | "high";
  successRate: number;
  personalityTraits: string[];
  recommendations: string[];
}

export async function getUserBehaviorInsights(
  userId: string
): Promise<UserBehaviorInsights> {
  const [likes, messages, views, , member] = await Promise.all([
    // Get all likes
    prisma.like.findMany({
      where: { sourceUserId: userId },
      include: {
        targetMember: {
          select: {
            dateOfBirth: true,
            city: true,
            interests: { select: { name: true } },
          },
        },
      },
    }),
    // Get all sent messages
    prisma.message.findMany({
      where: { senderId: userId },
      include: {
        recipient: {
          select: { name: true, dateOfBirth: true },
        },
      },
      orderBy: { created: "desc" },
      take: 50,
    }),
    // Get profile views
    prisma.profileView.findMany({
      where: { viewerId: userId },
      take: 50,
    }),
    // Get interactions
    prisma.userInteraction.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
    // Get user's member profile
    prisma.member.findUnique({
      where: { userId },
      include: {
        interests: { select: { name: true } },
      },
    }),
  ]);

  // Analyze preferred age range
  const ages = likes
    .map((like) => {
      if (!like.targetMember?.dateOfBirth) return null;
      return (
        new Date().getFullYear() -
        new Date(like.targetMember.dateOfBirth).getFullYear()
      );
    })
    .filter((age): age is number => age !== null);

  const preferredAgeRange: [number, number] =
    ages.length > 0 ? [Math.min(...ages), Math.max(...ages)] : [25, 35];

  // Analyze preferred cities
  const cityCount = new Map<string, number>();
  likes.forEach((like) => {
    const city = like.targetMember?.city;
    if (city) {
      cityCount.set(city, (cityCount.get(city) || 0) + 1);
    }
  });
  const preferredCities = Array.from(cityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([city]) => city);

  // Analyze preferred interests
  const interestCount = new Map<string, number>();
  likes.forEach((like) => {
    like.targetMember?.interests?.forEach((interest) => {
      interestCount.set(
        interest.name,
        (interestCount.get(interest.name) || 0) + 1
      );
    });
  });
  const preferredInterests = Array.from(interestCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([interest]) => interest);

  // Calculate activity level
  const totalActivity = likes.length + messages.length + views.length;
  const activityLevel: "low" | "medium" | "high" =
    totalActivity > 50 ? "high" : totalActivity > 20 ? "medium" : "low";

  // Calculate response rate
  const receivedMessages = await prisma.message.count({
    where: { recipientId: userId },
  });
  const successRate =
    receivedMessages > 0 ? (messages.length / receivedMessages) * 100 : 0;

  // Analyze personality traits based on behavior
  const personalityTraits: string[] = [];
  if (messages.length > likes.length * 0.5) {
    personalityTraits.push("תקשורתי");
  }
  if (likes.length > 30) {
    personalityTraits.push("פתוח להכרויות");
  }
  if (preferredInterests.length > 3) {
    personalityTraits.push("בעל תחומי עניין מגוונים");
  }
  if (activityLevel === "high") {
    personalityTraits.push("פעיל ומעורב");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (likes.length < 10) {
    recommendations.push("נסה לתת יותר לייקים - זה מגדיל את הסיכויים למאץ'");
  }
  if (messages.length < 5) {
    recommendations.push("התחל שיחות עם האנשים שעשית להם מאץ' - אל תחכה!");
  }
  if (!member?.image) {
    recommendations.push("הוסף תמונת פרופיל איכותית - זה משנה הכל!");
  }
  if (activityLevel === "low") {
    recommendations.push("היה יותר פעיל באפליקציה - התחבר לפחות פעם ביום");
  }

  return {
    totalLikes: likes.length,
    totalMessages: messages.length,
    totalViews: views.length,
    averageResponseTime: 0, // TODO: Calculate from message timestamps
    preferredAgeRange,
    preferredCities,
    preferredInterests,
    activityLevel,
    successRate,
    personalityTraits,
    recommendations,
  };
}

/**
 * Generate personalized ice breaker for a specific match
 */
export async function generatePersonalizedIceBreaker(
  userId: string,
  targetUserId: string
): Promise<string[]> {
  const [currentUser, targetMember, commonInterests] = await Promise.all([
    prisma.member.findUnique({
      where: { userId },
      include: { interests: { select: { name: true } } },
    }),
    prisma.member.findUnique({
      where: { userId: targetUserId },
      include: { interests: { select: { name: true } } },
    }),
    // Find common interests
    prisma.$queryRaw`
      SELECT i1.name
      FROM "Interest" i1
      INNER JOIN "Interest" i2 ON i1.name = i2.name
      WHERE i1."memberId" = (SELECT id FROM "Member" WHERE "userId" = ${userId})
        AND i2."memberId" = (SELECT id FROM "Member" WHERE "userId" = ${targetUserId})
    `,
  ]);

  if (!currentUser || !targetMember) {
    return [
      "היי! ראיתי את הפרופיל שלך ונראה שיש לנו הרבה במשותף 😊",
      "מה קורה? הפרופיל שלך ממש עניין אותי, מה עושים?",
      "שלום! נראה שאנחנו מאותו האזור, איך את/ה?",
    ];
  }

  const iceBreakers: string[] = [];
  const common = commonInterests as Array<{ name: string }>;

  // Based on common interests
  if (common && common.length > 0) {
    const interest = common[0].name;
    iceBreakers.push(
      `ראיתי שגם את/ה אוהב/ת ${interest}! איזה ${interest === "ספורט" ? "ענף" : "סוג"} הכי מעניין אותך?`
    );
    iceBreakers.push(
      `${interest} - זה ממש מעניין! ספר/י לי, מה הדבר האחרון שעשית בתחום?`
    );
  }

  // Based on location
  if (currentUser.city === targetMember.city) {
    iceBreakers.push(
      `גם את/ה מ${targetMember.city}! איזה מקום אהוב עליך בעיר?`
    );
    iceBreakers.push(`שכנים מ${targetMember.city}! יש לך מסעדה מומלצת באזור?`);
  }

  // Based on profile description
  if (targetMember.description) {
    iceBreakers.push(
      `קראתי את הפרופיל שלך וזה ממש מעניין! ${targetMember.description.includes("נסיעות") ? "לאן הטיול הכי מעניין שעשית?" : "ספר/י לי יותר על עצמך!"}`
    );
  }

  // Generic but personalized
  iceBreakers.push(
    `היי ${targetMember.name}! הפרופיל שלך ממש מעניין, מה עושים היום?`
  );

  return iceBreakers.slice(0, 3);
}

/**
 * Analyze why a specific match is good
 */
export async function analyzeMatchReason(
  userId: string,
  targetUserId: string
): Promise<string> {
  const [currentUser, targetMember] = await Promise.all([
    prisma.member.findUnique({
      where: { userId },
      include: {
        interests: { select: { name: true } },
        user: {
          select: {
            preferredAgeMin: true,
            preferredAgeMax: true,
            preferredGenders: true,
          },
        },
      },
    }),
    prisma.member.findUnique({
      where: { userId: targetUserId },
      include: {
        interests: { select: { name: true } },
      },
    }),
  ]);

  if (!currentUser || !targetMember) {
    return "זו התאמה טובה בהתבסס על ההעדפות שלך";
  }

  const reasons: string[] = [];

  // Age compatibility
  const targetAge =
    new Date().getFullYear() - new Date(targetMember.dateOfBirth).getFullYear();
  const preferredMin = currentUser.user?.preferredAgeMin || 18;
  const preferredMax = currentUser.user?.preferredAgeMax || 100;

  if (targetAge >= preferredMin && targetAge <= preferredMax) {
    reasons.push(
      `גיל ${targetAge} - בדיוק בטווח שחיפשת (${preferredMin}-${preferredMax})`
    );
  }

  // Location
  if (currentUser.city === targetMember.city) {
    reasons.push(`שניכם מ${targetMember.city} - קרובים גיאוגרפית!`);
  }

  // Common interests
  const currentInterests = currentUser.interests?.map((i) => i.name) || [];
  const targetInterests = targetMember.interests?.map((i) => i.name) || [];
  const common = currentInterests.filter((i) =>
    targetInterests.some((ti) => ti.toLowerCase().includes(i.toLowerCase()))
  );

  if (common.length > 0) {
    reasons.push(`תחומי עניין משותפים: ${common.slice(0, 2).join(", ")}`);
  }

  // Personality match from description
  if (
    currentUser.description &&
    targetMember.description &&
    currentUser.description.length > 50 &&
    targetMember.description.length > 50
  ) {
    reasons.push("סגנון כתיבה וביטוי דומים בפרופיל");
  }

  if (reasons.length === 0) {
    return "זו התאמה מעניינת שכדאי לבדוק - לפעמים הפתעות הן הכי טובות!";
  }

  return reasons.join(" • ");
}

/**
 * Get proactive insights for the user
 */
export async function getProactiveInsights(
  userId: string
): Promise<string | null> {
  const [likesGiven, likesReceived, recentMessages, member] = await Promise.all(
    [
      prisma.like.count({
        where: { sourceUserId: userId },
      }),
      prisma.like.count({
        where: { targetUserId: userId },
      }),
      prisma.message.findMany({
        where: { recipientId: userId, dateRead: null },
        take: 5,
      }),
      prisma.member.findUnique({
        where: { userId },
        include: {
          photos: { where: { isApproved: true } },
        },
      }),
    ]
  );

  // New matches waiting
  if (likesReceived > likesGiven && likesReceived - likesGiven > 3) {
    return `יש לך ${likesReceived - likesGiven} לייקים חדשים שלא ראית! בוא נבדוק מי הם 🎉`;
  }

  // Unread messages
  if (recentMessages.length > 0) {
    return `יש לך ${recentMessages.length} הודעות שלא קראת! אולי מישהו מעניין מחכה לתשובה 💬`;
  }

  // No photo
  if (!member?.photos || member.photos.length === 0) {
    return "עדיין אין לך תמונות מאושרות בפרופיל - זה משפיע מאוד על ההתאמות שלך! 📸";
  }

  // Low activity
  const lastActivity = await prisma.userInteraction.findFirst({
    where: { userId },
    orderBy: { timestamp: "desc" },
  });

  if (
    lastActivity &&
    new Date().getTime() - new Date(lastActivity.timestamp).getTime() >
      7 * 24 * 60 * 60 * 1000
  ) {
    return "לא ראינו אותך כבר שבוע! יש התאמות חדשות שמחכות לך 😊";
  }

  return null;
}
