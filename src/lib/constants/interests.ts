// /lib/constants/interests.ts
export const availableInterests = [
  // Entertainment
  { id: "music", name: "מוזיקה", icon: "🎵", category: "entertainment" },
  { id: "movies", name: "סרטים", icon: "🎬", category: "entertainment" },
  { id: "reading", name: "קריאה", icon: "📚", category: "entertainment" },
  { id: "art", name: "אומנות", icon: "🎨", category: "entertainment" },
  { id: "theater", name: "תיאטרון", icon: "🎭", category: "entertainment" },
  { id: "dance", name: "ריקוד", icon: "💃", category: "entertainment" },
  { id: "concerts", name: "הופעות", icon: "🎤", category: "entertainment" },
  { id: "museums", name: "מוזיאונים", icon: "🏛️", category: "entertainment" },

  // Outdoor
  { id: "travel", name: "טיולים", icon: "✈️", category: "outdoor" },
  { id: "sports", name: "ספורט", icon: "⚽", category: "outdoor" },
  { id: "gardening", name: "גינון", icon: "🌱", category: "outdoor" },
  { id: "hiking", name: "הליכה", icon: "🥾", category: "outdoor" },
  { id: "camping", name: "קמפינג", icon: "⛺", category: "outdoor" },
  { id: "fishing", name: "דיג", icon: "🎣", category: "outdoor" },
  { id: "cycling", name: "רכיבה על אופניים", icon: "🚴", category: "outdoor" },
  { id: "beach", name: "חוף הים", icon: "🏖️", category: "outdoor" },
  { id: "skiing", name: "סקי", icon: "⛷️", category: "outdoor" },
  { id: "swimming", name: "שחייה", icon: "🏊", category: "outdoor" },

  // Hobbies
  { id: "cooking", name: "בישול", icon: "👨‍🍳", category: "hobbies" },
  { id: "photography", name: "צילום", icon: "📷", category: "hobbies" },
  { id: "crafts", name: "יצירה", icon: "🧶", category: "hobbies" },
  { id: "diy", name: "עשה זאת בעצמך", icon: "🔨", category: "hobbies" },
  { id: "collecting", name: "אספנות", icon: "🏺", category: "hobbies" },
  { id: "writing", name: "כתיבה", icon: "✍️", category: "hobbies" },
  { id: "gaming", name: "משחקי וידאו", icon: "🎮", category: "hobbies" },
  { id: "boardgames", name: "משחקי לוח", icon: "🎲", category: "hobbies" },
  { id: "puzzles", name: "פאזלים", icon: "🧩", category: "hobbies" },

  // Tech
  { id: "technology", name: "טכנולוגיה", icon: "💻", category: "tech" },
  { id: "programming", name: "תכנות", icon: "👨‍💻", category: "tech" },
  { id: "gadgets", name: "גאדג׳טים", icon: "📱", category: "tech" },
  { id: "ai", name: "בינה מלאכותית", icon: "🤖", category: "tech" },
  { id: "science", name: "מדע", icon: "🔬", category: "tech" },

  // Wellness
  { id: "yoga", name: "יוגה", icon: "🧘", category: "wellness" },
  { id: "meditation", name: "מדיטציה", icon: "🧠", category: "wellness" },
  { id: "fitness", name: "כושר", icon: "💪", category: "wellness" },
  { id: "nutrition", name: "תזונה", icon: "🥗", category: "wellness" },
  { id: "mindfulness", name: "מיינדפולנס", icon: "✨", category: "wellness" },
  { id: "spa", name: "ספא", icon: "💆", category: "wellness" },

  // Food & Drink
  { id: "wine", name: "יין", icon: "🍷", category: "food" },
  { id: "beer", name: "בירה", icon: "🍺", category: "food" },
  { id: "coffee", name: "קפה", icon: "☕", category: "food" },
  { id: "foodie", name: "אוכל", icon: "🍽️", category: "food" },
  { id: "baking", name: "אפייה", icon: "🍰", category: "food" },
  { id: "restaurants", name: "מסעדות", icon: "🍴", category: "food" },

  // Social
  { id: "volunteering", name: "התנדבות", icon: "🤝", category: "social" },
  { id: "politics", name: "פוליטיקה", icon: "🗳️", category: "social" },
  { id: "clubbing", name: "מועדונים", icon: "🪩", category: "social" },
  { id: "activism", name: "אקטיביזם", icon: "✊", category: "social" },
  { id: "community", name: "קהילה", icon: "👥", category: "social" },

  // Spiritual
  { id: "religion", name: "דת", icon: "🕊️", category: "spiritual" },
  { id: "astrology", name: "אסטרולוגיה", icon: "⭐", category: "spiritual" },
  { id: "tarot", name: "טארוט", icon: "🔮", category: "spiritual" },

  // Pets
  { id: "dogs", name: "כלבים", icon: "🐕", category: "pets" },
  { id: "cats", name: "חתולים", icon: "🐈", category: "pets" },
  { id: "pets", name: "חיות מחמד", icon: "🐾", category: "pets" },
  { id: "birds", name: "ציפורים", icon: "🦜", category: "pets" },

  // Education
  { id: "languages", name: "שפות", icon: "🗣️", category: "education" },
  { id: "history", name: "היסטוריה", icon: "📜", category: "education" },
  { id: "philosophy", name: "פילוסופיה", icon: "🧠", category: "education" },
  { id: "astronomy", name: "אסטרונומיה", icon: "🔭", category: "education" },
];

// Define interest categories
export const interestCategories = [
  { id: "entertainment", name: "תרבות ובידור", icon: "🎭" },
  { id: "outdoor", name: "פעילויות חוץ", icon: "🌳" },
  { id: "hobbies", name: "תחביבים", icon: "✨" },
  { id: "tech", name: "טכנולוגיה", icon: "💻" },
  { id: "wellness", name: "בריאות ורווחה", icon: "🧘" },
  { id: "food", name: "אוכל ומשקאות", icon: "🍽️" },
  { id: "social", name: "חברה וקהילה", icon: "👥" },
  { id: "spiritual", name: "רוחניות", icon: "🕊️" },
  { id: "pets", name: "חיות מחמד", icon: "🐾" },
  { id: "education", name: "חינוך ולמידה", icon: "📚" },
];
