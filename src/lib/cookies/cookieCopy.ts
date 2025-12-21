export const cookieConsentCopy = {
  banner: {
    title: "שימוש בעוגיות",
    description:
      "לידיעתך, באתר זה נעשה שימוש בקבצי Cookies של צדדים שלישים בהם האתר נעזר לניתוח השימוש באתר, למטרות סטטיסטיות ושיפור חוויית המשתמש. למידע נוסף ניתן לעיין ",
    termsLink: "בתקנון ותנאי שימוש",
    acceptAll: "אישור הכל",
    necessaryOnly: "עוגיות חיוניות בלבד",
  },

  modal: {
    title: "העדפות עוגיות",
    description:
      "אנחנו מכבדים את הפרטיות שלך. בחר אילו עוגיות אתה מאשר לנו להשתמש.",
    savePreferences: "שמירת העדפות",
    acceptAll: "אישור הכל",
    rejectAll: "דחיית הכל",
    close: "סגירה",

    categories: {
      necessary: {
        title: "עוגיות חיוניות",
        description:
          "עוגיות אלה נדרשות לתפעול האתר ואינן ניתנות לביטול. הן מאפשרות פונקציות בסיסיות כמו אבטחה, ניהול רשת וגישה.",
        required: "נדרש",
      },
      analytics: {
        title: "עוגיות אנליטיות",
        description:
          "עוגיות אלה עוזרות לנו להבין כיצד משתמשים מתקשרים עם האתר. כל המידע נאסף באופן אנונימי ומסייע לנו לשפר את השירות.",
        toggle: "אישור עוגיות אנליטיות",
      },
      marketing: {
        title: "עוגיות שיווקיות",
        description:
          "עוגיות אלה משמשות להצגת פרסומות רלוונטיות יותר לך. הן גם מגבילות את מספר הפעמים שאתה רואה מודעה ועוזרות למדוד את יעילות הקמפיינים.",
        toggle: "אישור עוגיות שיווקיות",
      },
    },
  },

  footer: {
    manageCookies: "ניהול עוגיות",
  },

  notifications: {
    preferencesSaved: "העדפות העוגיות נשמרו בהצלחה",
    preferencesError: "אירעה שגיאה בשמירת העדפות העוגיות",
    allAccepted: "כל העוגיות אושרו",
    allRejected: "העוגיות האופציונליות נדחו",
  },
};

export type CookieConsentCopyKey = keyof typeof cookieConsentCopy;
