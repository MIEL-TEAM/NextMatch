# 🤖 איך הבינה המלאכותית עובדת ב-Miel

## תהליך מלא בעברית פשוטה

---

## 📱 **שלב 1: המשתמש שולח הודעה (Frontend)**

### מה קורה בדפדפן:

```
משתמש כותב שאלה ← לוחץ "שלח" ← הקומפוננט AIChatModal.tsx מופעל
```

**הקוד ב-Frontend** (`AIChatModal.tsx`):

```typescript
// משתמש לוחץ שלח
const sendMessage = async (content: string) => {
  // 1. בודקים שהמשתמש לא עבר את המגבלה היומית
  if (dailyUsage >= maxDailyQueries) {
    alert("הגעת למגבלה היומית");
    return;
  }

  // 2. מוסיפים את ההודעה למסך (כדי שהמשתמש יראה אותה מיד)
  setMessages([...messages, userMessage]);

  // 3. שולחים את ההודעה לשרת
  const response = await fetch("/api/ai-assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "מה ההתאמות הכי טובות שלי?",
      conversationHistory: messages.slice(-10), // 10 ההודעות האחרונות
    }),
  });
};
```

**מה נשלח לשרת:**

```json
{
  "message": "מה ההתאמות הכי טובות שלי?",
  "conversationHistory": [
    { "role": "user", "content": "שלום" },
    { "role": "assistant", "content": "היי! איך אפשר לעזור?" }
  ]
}
```

---

## 🔒 **שלב 2: הבקשה מגיעה לשרת (Backend - אבטחה)**

### מה קורה בשרת:

**הקוד ב-Backend** (`/api/ai-assistant/chat/route.ts`):

```typescript
export async function POST(req: NextRequest) {
  // 🔐 1. בדיקת זהות - האם המשתמש מחובר?
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 📝 2. קריאת ההודעה מהבקשה
  const { message, conversationHistory } = await req.json();

  // ✅ 3. ולידציה - בודקים שההודעה תקינה
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  // 🚦 4. בדיקת מגבלות שימוש יומיות
  const dailyUsage = await prisma.aIUsageLog.count({
    where: {
      userId,
      action: "chat",
      createdAt: { gte: today },
    },
  });

  const maxDailyQueries = user.isPremium ? 999 : 5;
  if (dailyUsage >= maxDailyQueries) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }
}
```

**תרגום לעברית פשוטה:**

1. ✅ בודקים שהמשתמש מחובר (אם לא - מחזירים שגיאה)
2. ✅ קוראים את ההודעה שנשלחה
3. ✅ מוודאים שההודעה תקינה (לא ריקה)
4. ✅ בודקים שהמשתמש לא עבר את המגבלה היומית (5 הודעות למשתמש רגיל, אינסוף לפרימיום)

---

## 🧠 **שלב 3: הכנת המידע ושליחה ל-OpenAI**

### איך השרת בונה את השאלה ל-AI:

```typescript
// 1. מביאים את כל המידע הרלוונטי על המשתמש מהדאטאבייס
const [user, member] = await Promise.all([
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      isPremium: true,
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

// 2. מחשבים סטטיסטיקות התנהגות
const behaviorInsights = await getUserBehaviorInsights(userId);
// דוגמה למה שמחזירים:
// {
//   totalLikes: 25,
//   totalMessages: 10,
//   totalViews: 150,
//   activityLevel: "גבוה",
//   successRate: 40
// }

// 3. בונים את ההקשר (Context) ל-AI
const systemPrompt = `
אתה עוזר AI אישי באפליקציית היכרויות "Miel".
המשתמש: ${user.name}, בן/בת ${userAge}, ${member.gender}
תחומי עניין: ${interests}
העדפות: מחפש/ת ${preferredGenders} בגילאי ${preferredAgeMin}-${preferredAgeMax}

סטטיסטיקות:
- לייקים שנתן/ה: ${behaviorInsights.totalLikes}
- הודעות ששלח/ה: ${behaviorInsights.totalMessages}
- צפיות בפרופיל: ${behaviorInsights.totalViews}
- רמת פעילות: ${behaviorInsights.activityLevel}

תן עצות אישיות, מעשיות וידידותיות בעברית.
`;

// 4. שולחים ל-OpenAI
const messages = [
  { role: "system", content: systemPrompt },
  ...conversationHistory, // ההיסטוריה של השיחה
  { role: "user", content: message }, // ההודעה החדשה
];

const startTime = Date.now();
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini", // המודל של OpenAI
  messages,
  temperature: 0.7, // כמה יצירתי (0-1)
  max_tokens: 500, // מקסימום אורך תשובה
});

const duration = Date.now() - startTime; // כמה זמן לקח
const assistantMessage = completion.choices[0].message.content;
```

**תרגום לעברית:**

1. 📊 מושכים את כל המידע על המשתמש מהדאטאבייס (שם, גיל, העדפות, תחומי עניין)
2. 📈 מחשבים סטטיסטיקות (כמה לייקים נתן, כמה הודעות שלח, וכו')
3. 📝 בונים "הקשר" מפורט ל-AI כדי שיבין מי המשתמש
4. 🚀 שולחים הכל ל-OpenAI GPT-4o-mini
5. ⏱️ מחכים לתשובה (בדרך כלל 1-3 שניות)

---

## 🎯 **שלב 4: AI מזהה כוונה ומוסיף מידע נוסף**

```typescript
// מנתח את הכוונה של המשתמש
function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("התאמ") || lowerMessage.includes("match")) {
    return "find_matches"; // רוצה למצוא התאמות
  }
  if (lowerMessage.includes("התקדמות") || lowerMessage.includes("סטטיסטיק")) {
    return "progress_analysis"; // רוצה לראות סטטיסטיקות
  }
  if (lowerMessage.includes("פרופיל") || lowerMessage.includes("לשפר")) {
    return "improve_profile"; // רוצה לשפר פרופיל
  }

  return "general"; // שאלה כללית
}

// אם המשתמש שאל על התאמות - מביאים את ההתאמות האמיתיות!
if (intent === "find_matches") {
  const matches = await getSmartMatches("1", "5");
  metadata.matches = matches.items.slice(0, 3).map((m) => ({
    userId: m.userId,
    name: m.name,
    age: calculateAge(m.dateOfBirth),
    city: m.city,
    matchScore: m.matchScore,
    reason: "סיבת ההתאמה המפורטת",
  }));
}
```

**מה זה אומר:**

- אם שאלת "מה ההתאמות שלי?" → השרת **באמת** מביא את ההתאמות שלך מהדאטאבייס
- אם שאלת "איך התקדמתי?" → מביא סטטיסטיקות אמיתיות
- ה-AI לא ממציא נתונים - הוא מקבל נתונים **אמיתיים** מהאפליקציה!

---

## 💾 **שלב 5: שמירת השיחה בדאטאבייס**

```typescript
// 1. שומרים את ההודעה של המשתמש
await prisma.aIMessage.create({
  data: {
    conversationId: conversation.id,
    role: "user",
    content: message,
  },
});

// 2. שומרים את התשובה של ה-AI
const savedMessage = await prisma.aIMessage.create({
  data: {
    conversationId: conversation.id,
    role: "assistant",
    content: assistantMessage,
    metadata: metadata, // מידע נוסף (התאמות, סטטיסטיקות)
    tokensUsed: tokensUsed, // כמה "טוקנים" נוצלו (לצורכי תשלום ל-OpenAI)
  },
});

// 3. רושמים בלוג לצורכי מעקב
await prisma.aIUsageLog.create({
  data: {
    userId,
    action: "chat",
    tokens: tokensUsed,
  },
});

// 4. מעדכנים את זמן השיחה
await prisma.aIConversation.update({
  where: { id: conversation.id },
  data: { updatedAt: new Date() },
});
```

**למה לשמור הכל?**

- 💬 כדי שהמשתמש יראה את ההיסטוריה בפעם הבאה
- 📊 למעקב אחר שימוש (מגבלות יומיות)
- 💰 לחישוב עלויות (OpenAI גובה לפי טוקנים)

---

## 📤 **שלב 6: שליחת התשובה חזרה ל-Frontend**

```typescript
// השרת מחזיר תשובה JSON
return NextResponse.json({
  messageId: savedMessage.id,
  content: assistantMessage, // התשובה של ה-AI
  metadata, // מידע נוסף (התאמות, סטטיסטיקות)
  tokensUsed,
});
```

**דוגמת תשובה:**

```json
{
  "messageId": "123456",
  "content": "מצאתי לך 3 התאמות מעולות! הנה הכי טובות:\n\n1. שרה, בת 28 מתל אביב - אוהבת ספורט ונסיעות כמוך!\n2. רחל, בת 26 מירושלים - 85% התאמה בתחומי עניין\n3. דנה, בת 27 מחיפה - גם היא אוהבת מוזיקה ואוכל",
  "metadata": {
    "matches": [
      { "name": "שרה", "age": 28, "city": "תל אביב", "matchScore": 92 },
      { "name": "רחל", "age": 26, "city": "ירושלים", "matchScore": 85 },
      { "name": "דנה", "age": 27, "city": "חיפה", "matchScore": 80 }
    ]
  },
  "tokensUsed": 450
}
```

---

## 🎨 **שלב 7: הצגת התשובה למשתמש**

```typescript
// Frontend מקבל את התשובה
const data = await response.json();

// מוסיפים את התשובה לצ'אט
const assistantMessage = {
  id: data.messageId,
  role: "assistant",
  content: data.content,
  metadata: data.metadata,
  createdAt: new Date(),
};

setMessages((prev) => [...prev, assistantMessage]);
// המשתמש רואה את התשובה בזמן אמת! ✨
```

**מה המשתמש רואה:**

- 💬 ההודעה שלו
- 🤖 תשובת ה-AI (עם אנימציה של כתיבה)
- 🎯 אם יש התאמות - כרטיסים לחיצים עם התאמות
- 📊 אם יש סטטיסטיקות - גרפים ומספרים

---

## 📊 **סיכום התהליך המלא**

```
┌─────────────┐
│  משתמש      │
│  כותב שאלה  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Frontend (React)       │
│  - בדיקת מגבלות        │
│  - הצגת ההודעה במסך    │
│  - שליחה ל-API         │
└──────┬──────────────────┘
       │ POST /api/ai-assistant/chat
       ▼
┌─────────────────────────┐
│  Backend API Route      │
│  🔐 בדיקת אימות         │
│  ✅ ולידציה             │
│  🚦 בדיקת מגבלות        │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  איסוף מידע             │
│  📊 נתוני משתמש         │
│  📈 סטטיסטיקות         │
│  💑 התאמות פוטנציאליות │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  OpenAI GPT-4o-mini     │
│  🧠 מעבד את השאלה      │
│  💭 מייצר תשובה מותאמת │
│  ⏱️ 1-3 שניות          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  שמירה בדאטאבייס       │
│  💾 הודעת משתמש         │
│  💾 תשובת AI            │
│  📊 לוג שימוש           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  תשובה ל-Frontend       │
│  📤 JSON עם התשובה     │
│  🎯 מידע נוסף (metadata)│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  משתמש רואה תשובה      │
│  ✨ בזמן אמת!           │
└─────────────────────────┘
```

---

## 🔒 **אבטחה ופרטיות**

### מה עושים כדי לשמור על אבטחה:

1. **אימות חובה** - רק משתמשים מחוברים יכולים להשתמש ב-AI
2. **מגבלות שימוש** - 5 שאילתות ליום למשתמש רגיל (למנוע שימוש לרעה)
3. **ולידציה** - בודקים שההודעות תקינות
4. **API Key מוצפן** - המפתח ל-OpenAI נשמר בסביבת השרת בלבד (`process.env.OPENAI_API_KEY`)
5. **שמירת היסטוריה** - כל שיחה נשמרת בדאטאבייס (אבל רק למשתמש עצמו)

---

## ⚡ **ביצועים**

- **זמן תגובה ממוצע**: 1-3 שניות
- **מודל AI**: GPT-4o-mini (מהיר וזול)
- **מגבלת תווים**: עד 500 תווים בתשובה
- **הקשר**: 10 ההודעות האחרונות בשיחה
- **עלות**: ~0.0001$ לשאילתה (זול מאוד!)

---

## 💡 **למה זה מיוחד ב-Miel?**

1. **AI מותאם אישית** 🎯

   - מכיר את הפרופיל שלך
   - יודע את ההעדפות שלך
   - רואה את הסטטיסטיקות שלך

2. **נתונים אמיתיים** 📊

   - לא ממציא התאמות - מביא **התאמות אמיתיות** מהדאטאבייס
   - סטטיסטיקות מדויקות מתוך השימוש שלך

3. **הקשר מלא** 💭

   - זוכר את השיחה הקודמת
   - מבין את ההיסטוריה שלך באפליקציה
   - נותן עצות מבוססות נתונים

4. **מהיר ויעיל** ⚡
   - תשובה תוך שניות
   - עובד בזמן אמת
   - חוויית צ'אט חלקה

---

## 🎓 **מונחים טכניים בעברית**

| מונח            | הסבר                              |
| --------------- | --------------------------------- |
| **Frontend**    | החלק שהמשתמש רואה (הדפדפן)        |
| **Backend**     | השרת שמטפל בלוגיקה                |
| **API Route**   | כתובת בשרת שמטפלת בבקשות          |
| **OpenAI**      | החברה שמספקת את ה-AI (ChatGPT)    |
| **GPT-4o-mini** | המודל הספציפי שאנחנו משתמשים בו   |
| **Tokens**      | יחידת מדידה (מילים) שה-AI מעבד    |
| **Context**     | ההקשר שה-AI מקבל (מידע על המשתמש) |
| **Metadata**    | מידע נוסף (התאמות, סטטיסטיקות)    |
| **Rate Limit**  | מגבלת שימוש יומית                 |
| **Prisma**      | הדרך שאנחנו מדברים עם הדאטאבייס   |

---

**זהו! עכשיו אתה יודע בדיוק איך ה-AI עובד ב-Miel שלך! 🎉**
