"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { PaginatedResponse } from "@/types";
import { Member } from "@prisma/client";
import { addYears } from "date-fns";

interface MatchResult {
  userId: string;
  score: number;
  matchReason: string;
  compatibilityFactors: {
    ageCompatibility: number;
    locationCompatibility: number;
    interestCompatibility: number;
    personalityCompatibility: number;
    behavioralCompatibility: number;
  };
  premiumInsights?: string;
}

interface UserBehaviorPattern {
  preferredAgeRange: [number, number];
  preferredLocations: string[];
  interestPriorities: string[];
  personalityTraits: string[];
  messagingStyle: string;
  engagementLevel: number;
}

interface UserInteraction {
  id: string;
  userId: string;
  targetId: string;
  action: string;
  duration?: number;
  weight: number;
  timestamp: Date;
}

interface UserMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  created: Date;
}

interface BehaviorAnalysisData {
  interactions: UserInteraction[];
  likedUserIds: string[];
  messages: UserMessage[];
}

export async function trackUserInteraction(
  targetUserId: string,
  action: string,
  duration?: number
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    let weight = 1.0;
    switch (action) {
      case "view":
        weight = 0.5 + (duration ? Math.min(duration / 60, 5) * 0.1 : 0);
        break;
      case "like":
        weight = 2.0;
        break;
      case "message":
        weight = 3.0;
        break;
      case "profile_click":
        weight = 1.5;
        break;
      default:
        weight = 1.0;
    }

    const interaction = await prisma.userInteraction.create({
      data: {
        userId,
        targetId: targetUserId,
        action,
        duration,
        weight,
      },
    });

    return interaction;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error tracking user interaction:", error);
    }
    return null;
  }
}

export async function getSmartMatches(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _pageNumber = "1",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _pageSize = "12",
  filterGender?: string[],
  filterAgeRange?: number[]
): Promise<
  PaginatedResponse<Member & { matchReason?: string; matchScore?: number }>
> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { items: [], totalCount: 0 };
    }

    // const page = parseInt(pageNumber);
    // const limit = parseInt(pageSize);

    // Get user behavior data for analysis
    const [interactions, likedUserIds, messagedUserIds] = await Promise.all([
      prisma.userInteraction.findMany({
        where: { userId },
        select: { targetId: true, action: true, weight: true, duration: true },
        orderBy: { timestamp: "desc" },
        take: 100,
      }),
      prisma.like.findMany({
        where: { sourceUserId: userId },
        select: { targetUserId: true },
        take: 50,
      }),
      prisma.message.findMany({
        where: { senderId: userId },
        select: { recipientId: true, text: true },
        orderBy: { created: "desc" },
        take: 50,
      }),
    ]);

    const interactedUserIds = [
      ...interactions.map((i) => i.targetId),
      ...likedUserIds.map((l) => l.targetUserId),
      ...messagedUserIds.map((m) => m.recipientId),
    ].filter(Boolean) as string[];

    if (interactedUserIds.length === 0) {
      const randomMembers = await prisma.member.findMany({
        where: { userId: { not: userId } },
        include: {
          interests: { select: { name: true } },
          user: { select: { emailVerified: true } },
        },
        orderBy: { created: "desc" },
        take: 12,
      });

      const randomResults = randomMembers.map((member) => ({
        ...member,
        matchReason: `התאמה פוטנציאלית עם ${member.name}`,
        matchScore: Math.floor(Math.random() * 30) + 60,
      }));

      return { items: randomResults, totalCount: randomResults.length };
    }

    const uniqueUserIds = Array.from(new Set(interactedUserIds));

    // Get user preferences for filtering
    const userPreferences = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredGenders: true,
        preferredAgeMin: true,
        preferredAgeMax: true,
      },
    });

    // Build filter conditions - use UI filters first, then fallback to user preferences
    let genderFilter = {};
    let ageFilter = {};

    // Use filter from UI if provided, otherwise use user preferences
    if (filterGender && filterGender.length > 0) {
      genderFilter = { gender: { in: filterGender } };
      console.log("🎯 Using UI gender filter:", filterGender);
    } else if (userPreferences?.preferredGenders?.length) {
      const genders = Array.isArray(userPreferences.preferredGenders)
        ? userPreferences.preferredGenders
        : userPreferences.preferredGenders.split(",");

      genderFilter = { gender: { in: genders } };
      console.log("🎯 Using DB gender preferences:", genders);
    }

    // Use age filter from UI if provided, otherwise use user preferences
    if (filterAgeRange && filterAgeRange.length === 2) {
      const [minAge, maxAge] = filterAgeRange;
      const today = new Date();
      const minBirthDate = addYears(today, -maxAge - 1);
      const maxBirthDate = addYears(today, -minAge);

      ageFilter = {
        dateOfBirth: {
          gte: minBirthDate,
          lte: maxBirthDate,
        },
      };
      console.log("🎯 Using UI age filter:", filterAgeRange);
    } else if (
      userPreferences?.preferredAgeMin ||
      userPreferences?.preferredAgeMax
    ) {
      const today = new Date();
      const minBirthDate = userPreferences.preferredAgeMax
        ? addYears(today, -userPreferences.preferredAgeMax - 1)
        : undefined;
      const maxBirthDate = userPreferences.preferredAgeMin
        ? addYears(today, -userPreferences.preferredAgeMin)
        : undefined;

      if (minBirthDate && maxBirthDate) {
        ageFilter = {
          dateOfBirth: { gte: minBirthDate, lte: maxBirthDate },
        };
      } else if (minBirthDate) {
        ageFilter = { dateOfBirth: { gte: minBirthDate } };
      } else if (maxBirthDate) {
        ageFilter = { dateOfBirth: { lte: maxBirthDate } };
      }
      console.log(
        "🎯 Using DB age preferences:",
        userPreferences.preferredAgeMin,
        "-",
        userPreferences.preferredAgeMax
      );
    }

    const members = await prisma.member.findMany({
      where: {
        userId: { in: uniqueUserIds, not: userId },
        ...genderFilter,
        ...ageFilter,
      },
      include: {
        interests: { select: { name: true } },
        user: { select: { emailVerified: true } },
      },
      orderBy: { created: "desc" },
    });

    if (members.length === 0) {
      const randomMembers = await prisma.member.findMany({
        where: { userId: { not: userId } },
        include: {
          interests: { select: { name: true } },
          user: { select: { emailVerified: true } },
        },
        orderBy: { created: "desc" },
        take: 12,
      });

      const randomResults = randomMembers.map((member) => ({
        ...member,
        matchReason: `התאמה פוטנציאלית עם ${member.name}`,
        matchScore: Math.floor(Math.random() * 30) + 60,
      }));

      return { items: randomResults, totalCount: randomResults.length };
    }

    // מחיקת cache ישן כדי לקבל טקסטים חדשים ומגוונים
    await prisma.smartMatchCache.deleteMany({
      where: { userId },
    });

    // בדיקה אם יש cache של התאמות עדכני
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const cachedMatches = await prisma.smartMatchCache.findFirst({
      where: {
        userId,
        createdAt: { gte: sixHoursAgo },
      },
    });

    if (cachedMatches) {
      const cachedData = JSON.parse(cachedMatches.matchData);
      const cachedMemberIds = cachedData.map(
        (m: { userId: string }) => m.userId
      );

      const validMembers = members.filter((m) =>
        cachedMemberIds.includes(m.userId)
      );

      return {
        items: validMembers.map((m) => ({
          ...m,
          matchReason:
            cachedData.find(
              (c: { userId: string; matchReason: string }) =>
                c.userId === m.userId
            )?.matchReason || "",
          matchScore:
            cachedData.find(
              (c: { userId: string; matchScore: number }) =>
                c.userId === m.userId
            )?.matchScore || 0,
        })),
        totalCount: uniqueUserIds.length,
      };
    }

    // Analyze user behavior pattern
    const behaviorData: BehaviorAnalysisData = {
      interactions: interactions as UserInteraction[],
      likedUserIds: likedUserIds.map((l) => l.targetUserId),
      messages: messagedUserIds as UserMessage[],
    };

    const behaviorPattern = await analyzeUserBehaviorPattern(
      userId,
      behaviorData
    );

    // Get current user profile
    const currentUser = await prisma.member.findUnique({
      where: { userId },
      include: {
        interests: { select: { name: true } },
        user: {
          select: {
            preferredGenders: true,
            preferredAgeMin: true,
            preferredAgeMax: true,
          },
        },
      },
    });

    if (!currentUser) {
      return { items: [], totalCount: 0 };
    }

    // Calculate matches using advanced algorithm
    const matchResults = await calculateAdvancedMatches(
      currentUser,
      members,
      behaviorPattern,
      interactions as UserInteraction[]
    );

    // Create final results
    const scoreMap = new Map<string, number>();
    const reasonMap = new Map<string, string>();

    matchResults.forEach((match) => {
      scoreMap.set(match.userId, match.score);
      reasonMap.set(match.userId, match.matchReason);
    });

    const sortedMembers = [...members]
      .filter((m) => matchResults.some((mr) => mr.userId === m.userId))
      .sort(
        (a, b) => (scoreMap.get(b.userId) || 0) - (scoreMap.get(a.userId) || 0)
      );

    const finalResults = sortedMembers.map((m) => ({
      ...m,
      matchReason: reasonMap.get(m.userId) || "",
      matchScore: scoreMap.get(m.userId) || 0,
    }));

    // Save to cache
    try {
      const cacheData = finalResults.map((m) => ({
        userId: m.userId,
        matchReason: m.matchReason,
        matchScore: m.matchScore,
      }));

      await prisma.smartMatchCache.create({
        data: {
          userId,
          matchData: JSON.stringify(cacheData),
        },
      });
    } catch (error) {
      console.error("Error saving match cache:", error);
    }

    return {
      items: finalResults,
      totalCount: uniqueUserIds.length,
    };
  } catch {
    return { items: [], totalCount: 0 };
  }
}

async function analyzeUserBehaviorPattern(
  userId: string,
  data: BehaviorAnalysisData
): Promise<UserBehaviorPattern> {
  // Get liked users' profiles for pattern analysis
  const likedProfiles = await prisma.member.findMany({
    where: { userId: { in: data.likedUserIds } },
    include: { interests: true },
  });

  // Analyze age preferences
  const likedAges = likedProfiles
    .map(
      (p) => new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
    )
    .filter((age) => age > 0);

  const avgAge =
    likedAges.length > 0
      ? likedAges.reduce((sum, age) => sum + age, 0) / likedAges.length
      : 25;

  const preferredAgeRange: [number, number] =
    likedAges.length > 2
      ? [Math.min(...likedAges), Math.max(...likedAges)]
      : [avgAge - 5, avgAge + 5];

  // Analyze location preferences
  const preferredLocations = [
    ...new Set(likedProfiles.map((p) => p.city).filter(Boolean)),
  ];

  // Analyze interest priorities
  const interestCounts = new Map<string, number>();
  likedProfiles.forEach((profile) => {
    profile.interests?.forEach((interest) => {
      interestCounts.set(
        interest.name,
        (interestCounts.get(interest.name) || 0) + 1
      );
    });
  });

  const interestPriorities = Array.from(interestCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([interest]) => interest)
    .slice(0, 10);

  const messagingStyle = analyzeMessagingStyle(data.messages);
  const engagementLevel = calculateEngagementLevel(data.interactions);

  return {
    preferredAgeRange,
    preferredLocations,
    interestPriorities,
    personalityTraits: [],
    messagingStyle,
    engagementLevel,
  };
}

function analyzeMessagingStyle(messages: UserMessage[]): string {
  if (messages.length === 0) return "unknown";

  const totalLength = messages.reduce(
    (sum, m) => sum + (m.text?.length || 0),
    0
  );
  const avgLength = totalLength / messages.length;

  if (avgLength > 100) return "detailed";
  if (avgLength > 50) return "conversational";
  return "brief";
}

function calculateEngagementLevel(interactions: UserInteraction[]): number {
  if (interactions.length === 0) return 0.5;

  const totalWeight = interactions.reduce((sum, i) => sum + (i.weight || 1), 0);
  return Math.min(totalWeight / interactions.length / 3, 1);
}

async function calculateAdvancedMatches(
  currentUser: Member & { interests?: { name: string }[] },
  candidates: (Member & { interests?: { name: string }[] })[],
  behaviorPattern: UserBehaviorPattern,
  interactions: UserInteraction[]
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    const score = await calculateCompatibilityScore(
      currentUser,
      candidate,
      behaviorPattern,
      interactions
    );

    if (score.total >= 30) {
      // הורדנו את הסף מ-60 ל-30 כדי להציג יותר התאמות
      results.push({
        userId: candidate.userId,
        score: Math.min(score.total, 98),
        matchReason: generateMatchReason(currentUser, candidate, score),
        compatibilityFactors: score.factors,
        premiumInsights: generatePremiumInsights(score),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

async function calculateCompatibilityScore(
  currentUser: Member & { interests?: { name: string }[] },
  candidate: Member & { interests?: { name: string }[] },
  behaviorPattern: UserBehaviorPattern,
  interactions: UserInteraction[]
) {
  const currentUserAge =
    new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();
  const candidateAge =
    new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear();

  // Age compatibility (25 points) - שיפור הציונים
  const ageDiff = Math.abs(currentUserAge - candidateAge);
  const ageCompatibility =
    ageDiff <= 2
      ? 25
      : ageDiff <= 5
        ? 20
        : ageDiff <= 8
          ? 15
          : ageDiff <= 12
            ? 10
            : 5;

  // Location compatibility (20 points) - שיפור הציונים
  let locationCompatibility = 0;
  if (currentUser.city === candidate.city) {
    locationCompatibility = 20;
  } else if (
    behaviorPattern.preferredLocations.includes(candidate.city || "")
  ) {
    locationCompatibility = 15;
  } else {
    // נתן ציון בסיס גם אם לא באותה עיר
    locationCompatibility = 8;
  }

  // Interest compatibility (25 points) - שיפור הציונים
  const userInterests = currentUser.interests?.map((i) => i.name) || [];
  const candidateInterests = candidate.interests?.map((i) => i.name) || [];
  const commonInterests = userInterests.filter((interest: string) =>
    candidateInterests.some((ci: string) =>
      ci.toLowerCase().includes(interest.toLowerCase())
    )
  );
  // נתן ציון בסיס גם בלי תחומי עניין משותפים + שיפור הציון לתחומי עניין
  const interestCompatibility = Math.min(commonInterests.length * 8 + 5, 25);

  // Personality compatibility (15 points)
  const personalityCompatibility = await calculatePersonalityMatch(
    currentUser,
    candidate
  );

  // Behavioral compatibility (15 points)
  const behavioralCompatibility = calculateBehavioralMatch(
    candidate,
    interactions
  );

  const factors = {
    ageCompatibility,
    locationCompatibility,
    interestCompatibility,
    personalityCompatibility,
    behavioralCompatibility,
  };

  const total =
    ageCompatibility +
    locationCompatibility +
    interestCompatibility +
    personalityCompatibility +
    behavioralCompatibility;

  return { total, factors };
}

async function calculatePersonalityMatch(
  currentUser: Member,
  candidate: Member
): Promise<number> {
  // שיפור הציון - נתן ציון בסיס גבוה יותר
  if (!currentUser.description || !candidate.description) return 10;

  const userWords = currentUser.description.toLowerCase().split(/\s+/);
  const candidateWords = candidate.description.toLowerCase().split(/\s+/);

  const commonWords = userWords.filter(
    (word: string) =>
      word.length > 3 &&
      candidateWords.some(
        (cw: string) => cw.includes(word) || word.includes(cw)
      )
  );

  // שיפור הציון לתיאורים דומים
  return Math.min(commonWords.length * 3 + 5, 15);
}

function calculateBehavioralMatch(
  candidate: Member,
  interactions: UserInteraction[]
): number {
  const candidateInteractions = interactions.filter(
    (i) => i.targetId === candidate.userId
  );

  // שיפור הציון - נתן ציון בסיס גבוה יותר
  if (candidateInteractions.length === 0) return 10;

  const avgWeight =
    candidateInteractions.reduce((sum, i) => sum + i.weight, 0) /
    candidateInteractions.length;

  // שיפור הציון להתנהגות
  return Math.min(avgWeight * 7 + 3, 15);
}

function generateMatchReason(
  currentUser: Member & {
    interests?: { name: string }[];
    user?: {
      preferredGenders?: string;
      preferredAgeMin?: number;
      preferredAgeMax?: number;
    };
  },
  candidate: Member & { interests?: { name: string }[] },
  score: {
    factors: {
      ageCompatibility: number;
      locationCompatibility: number;
      interestCompatibility: number;
      personalityCompatibility: number;
    };
  }
): string {
  const candidateAge =
    new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
  // const currentUserAge =
  //   new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();
  // const ageDiff = Math.abs(currentUserAge - candidateAge);

  // קבלת ההעדפות הספציפיות של המשתמש
  const preferredAgeMin = currentUser.user?.preferredAgeMin || 18;
  const preferredAgeMax = currentUser.user?.preferredAgeMax || 100;
  const preferredGenders = currentUser.user?.preferredGenders || "male,female";

  // בדיקה אם המועמד בטווח הגילאים המבוקש (ריאליסטי)
  const isInAgeRange =
    candidateAge >= preferredAgeMin && candidateAge <= preferredAgeMax;

  // טקסט חכם לטווח הגילאים - לא מציג ברירות מחדל מוזרות
  const isDefaultRange = preferredAgeMin === 18 && preferredAgeMax === 100;
  const ageRangeText = isDefaultRange
    ? `בגיל מתאים`
    : preferredAgeMin === preferredAgeMax
      ? `בן ${preferredAgeMin}`
      : `בטווח ${preferredAgeMin}-${preferredAgeMax}`;

  // מערך של טקסטים אישיים מבוססי העדפות
  const ageReasons = isInAgeRange
    ? [
        `בן ${candidateAge} - בדיוק ${ageRangeText} שחיפשת! 🎯`,
        `גיל ${candidateAge} - מושלם! נכנס ${ageRangeText} שהגדרת 💫`,
        `${candidateAge} שנים - התאמה מדויקת להעדפות הגיל שלך (${ageRangeText}) ✨`,
        `בן ${candidateAge} - בדיוק מה שרצית! ${ageRangeText} 💖`,
        `גיל ${candidateAge} - פגע בול בהעדפות שלך ${ageRangeText}! 🌟`,
      ]
    : [
        `בן ${candidateAge} - קרוב לטווח שחיפשת, שווה הכרות! 💫`,
        `גיל ${candidateAge} - יוצא קצת מהטווח אבל נראה מעניין! ✨`,
        `${candidateAge} שנים - לפעמים הפתעות הן הכי טובות! 💖`,
        `בן ${candidateAge} - גיל מעניין שכדאי לתת לו הזדמנות! 🌟`,
      ];

  // טקסטים אישיים למיקום
  const locationReasons =
    currentUser.city === candidate.city
      ? [
          `גר ב${candidate.city} כמוך - שכנים! תוכלו להיפגש מתי שתרצו 🏠`,
          `${candidate.city} - אותה עיר שלך! פגישות ספונטניות בהישג יד 🚶‍♂️`,
          `מקומי מ${candidate.city} כמוך - לא צריך לנסוע רחוק! 📍`,
          `גם מ${candidate.city} - מכירים את אותם מקומות שאתה מכיר! 🗺️`,
          `חי ב${candidate.city} כמוך - באותו השכונה! 🏘️`,
        ]
      : [
          `גר ב${candidate.city} - קצת רחוק מ${currentUser.city} אבל שווה! 🌍`,
          `מ${candidate.city} - הזדמנות לטיולים רומנטיים! 💕`,
          `גר ב${candidate.city} - יכול להיות מעניין לחקור אזורים חדשים! 🗺️`,
          `מ${candidate.city} - המרחק לא אמור למנוע אהבה! ✈️`,
          `גר ב${candidate.city} - אולי זמן להרחיב את הגבולות! 🌟`,
        ];

  // טקסטים אישיים לאישיות (מבוססים על תיאור המשתמש)
  const hasDescription =
    currentUser.description && currentUser.description.length > 20;
  const personalityReasons = hasDescription
    ? [
        `אישיות שמזכירה אותך - תרגישו חיבור מיידי! 🧠`,
        `סגנון כתיבה דומה לשלך - אתם באותה הגל! ✍️`,
        `אופי שמתאים בדיוק לאישיות שלך! 🤝`,
        `תיאור שמדבר אליך - יש לכם הרבה במשותף! 😊`,
        `סגנון חיים שמתאים לך כמו כפפה! 🎨`,
      ]
    : [
        `אישיות מעניינת שכדאי להכיר! 🧠`,
        `נראה מעניין ושווה שיחה! ✍️`,
        `פרופיל שמושך את העין! 🤝`,
        `מישהו שיכול להפתיע אותך! 😊`,
        `אישיות מרתקת לחקירה! 🎨`,
      ];

  // טקסטים אישיים לתחומי עניין (מבוססים על התחביבים של המשתמש)
  const userInterestsCount = currentUser.interests?.length || 0;
  const interestReasons =
    userInterestsCount > 0
      ? [
          `תחומי עניין משותפים איתך - יש לכם על מה לדבר שעות! 💬`,
          `אותם תחביבים שלך - תוכלו לעשות הרבה דברים ביחד! 🎪`,
          `תחומי עניין שמתאימים בדיוק לטעם שלך! 🎯`,
          `אהבות משותפות איתך - בסיס מושלם לקשר! 💕`,
          `תחביבים דומים לשלך - תמיד יהיה לכם מה לעשות! 🎭`,
        ]
      : [
          `תחומי עניין מעניינים שכדאי לחקור! 💬`,
          `תחביבים שיכולים להעשיר אותך! 🎪`,
          `תחומי עניין שיפתחו לך עולמות חדשים! 🎯`,
          `אהבות שיכולות להיות משותפות! 💕`,
          `תחביבים שיכולים להיות מדבקים! 🎭`,
        ];

  // טקסטים גנריים אישיים (מבוססים על מין המועמד והעדפות המשתמש)
  const candidateGender =
    candidate.gender === "male"
      ? "גבר"
      : candidate.gender === "female"
        ? "אישה"
        : "אדם";
  const isPreferredGender = preferredGenders.includes(candidate.gender || "");

  const genericReasons = isPreferredGender
    ? [
        `${candidate.name} - ${candidateGender} שנראה מושלם בשבילך! 🌟`,
        `פרופיל של ${candidateGender} מעניין שישב לך בדיוק! ✨`,
        `${candidate.name} - ${candidateGender} שיכול להיות בדיוק מה שחיפשת! 💫`,
        `${candidateGender} מרתק שמתאים להעדפות שלך! 🎯`,
        `פרופיל של ${candidateGender} מעניין שכדאי לך להכיר! 💖`,
      ]
    : [
        `${candidate.name} - מעניין למרות שלא הסוג הרגיל שלך! 🌟`,
        `פרופיל מרתק שאולי יפתיע אותך! ✨`,
        `${candidate.name} - לפעמים כדאי לצאת מאזור הנוחות! 💫`,
        `מישהו שיכול להרחיב את האופקים שלך! 🎯`,
        `פרופיל מעניין שכדאי לתת לו הזדמנות! 💖`,
      ];

  // בחירה רנדומלית של סיבה מתאימה
  const reasons: string[] = [];

  if (score.factors.ageCompatibility >= 20) {
    const randomAgeReason =
      ageReasons[Math.floor(Math.random() * ageReasons.length)];
    reasons.push(randomAgeReason);
  }

  if (score.factors.locationCompatibility >= 15) {
    const randomLocationReason =
      locationReasons[Math.floor(Math.random() * locationReasons.length)];
    reasons.push(randomLocationReason);
  }

  if (score.factors.interestCompatibility >= 15) {
    const userInterests = currentUser.interests?.map((i) => i.name) || [];
    const candidateInterests = candidate.interests?.map((i) => i.name) || [];
    const commonInterests = userInterests
      .filter((interest: string) =>
        candidateInterests.some((ci: string) =>
          ci.toLowerCase().includes(interest.toLowerCase())
        )
      )
      .slice(0, 2);

    if (commonInterests.length > 0) {
      const randomInterestReason = interestReasons[
        Math.floor(Math.random() * interestReasons.length)
      ]
        .replace("תחומי עניין משותפים", `${commonInterests.join(" ו")} משותפים`)
        .replace("אותם תחביבים", `${commonInterests.join(" ו")} זהים`)
        .replace(
          "תחומי עניין מרתקים",
          `${commonInterests.join(" ו")} מעניינים`
        );
      reasons.push(randomInterestReason);
    }
  }

  if (score.factors.personalityCompatibility >= 10) {
    const randomPersonalityReason =
      personalityReasons[Math.floor(Math.random() * personalityReasons.length)];
    reasons.push(randomPersonalityReason);
  }

  // אם אין סיבות ספציפיות, בחר סיבה גנרית רנדומלית
  if (reasons.length === 0) {
    const randomGenericReason =
      genericReasons[Math.floor(Math.random() * genericReasons.length)];
    return randomGenericReason;
  }

  // בחר סיבה רנדומלית מהסיבות הזמינות
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generatePremiumInsights(score: {
  total: number;
  factors: { interestCompatibility: number };
}): string {
  const insights: string[] = [];

  if (score.total >= 90) {
    insights.push("התאמה נדירה - רק 2% מהמשתמשים מגיעים לרמת התאמה כזו");
  } else if (score.total >= 80) {
    insights.push("התאמה מעולה - בין 10% המובילים של ההתאמות שלך");
  }

  if (score.factors.interestCompatibility >= 20) {
    insights.push("רמת תחומי עניין גבוהה במיוחד - יש לכם הרבה במשותף");
  }

  return insights.join(" • ");
}

export async function getUserLikes(userId: string) {
  const likes = await prisma.like.findMany({
    where: { sourceUserId: userId },
    take: 50,
  });

  const targetUserIds = likes
    .map((like) => like.targetUserId)
    .filter(Boolean) as string[];
  const targetUsers = await prisma.member.findMany({
    where: { userId: { in: targetUserIds } },
    include: {
      interests: { select: { name: true } },
    },
  });

  return targetUsers.map((user) => ({
    name: user.name || "משתמש",
    gender: user.gender || "לא צוין",
    city: user.city || "לא צוין",
    dateOfBirth: user.dateOfBirth || new Date(),
    interests: user.interests || [],
  }));
}

export async function getUserMessages(userId: string) {
  const messages = await prisma.message.findMany({
    where: { senderId: userId },
    include: {
      recipient: {
        select: {
          name: true,
          gender: true,
        },
      },
    },
    orderBy: { created: "desc" },
    take: 50,
  });

  const recipients = await prisma.member.findMany({
    where: {
      userId: {
        in: messages.map((m) => m.recipientId).filter(Boolean) as string[],
      },
    },
    select: {
      userId: true,
      gender: true,
    },
  });

  return messages.map((message) => ({
    text: message.text,
    recipientName: message.recipient?.name || "משתמש",
    recipientGender:
      recipients.find((r) => r.userId === message.recipientId)?.gender ||
      "לא צוין",
  }));
}

export async function getUserInteractions(userId: string) {
  const interactions = await prisma.userInteraction.findMany({
    where: { userId },
    include: {
      target: {
        select: {
          name: true,
          gender: true,
          city: true,
          dateOfBirth: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 100,
  });

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
