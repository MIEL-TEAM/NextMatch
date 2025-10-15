import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendVerificationEmail(email: string, token: string) {
  let verificationLink = "";

  if (process.env.NODE_ENV === "development") {
    // Running locally
    verificationLink = `http://localhost:3000/verify-email?token=${token}`;
  } else {
    // Running in production
    verificationLink = `${baseUrl}/verify-email?token=${token}`;
  }

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: email,
    subject: "!אימות כתובת האימייל שלך - ברוך הבא למיאל",
    html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                    <span style="font-size: 32px;">🍯</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                    !ברוך הבא למיאל
                </h1>
            </div>
            
            <!-- Content -->
            <div dir="rtl" style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px; line-height: 1.4;">
                    אימות האימייל שלך
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                    היי! כדי להתחיל להכיר אנשים מדהימים, צריך לאמת את כתובת האימייל שלך.
                </p>
                
                <a href="${verificationLink}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); 
                          color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
                          transition: all 0.2s ease;">
                    אמת את האימייל שלך
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
                    לא נרשמת? אין בעיה - פשוט התעלם מהמייל הזה
                </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    עם המון אהבה, צוות <strong style="color: #f97316;">מיאל</strong> 💝
                </p>
            </div>
            
        </div>
    `,
  });
}
export async function sendWelcomeEmail(email: string, name: string) {
  let membersLink = "";

  if (process.env.NODE_ENV === "development") {
    // Running locally
    membersLink = `http://localhost:3000/members`;
  } else {
    // Running in production
    membersLink = `${baseUrl}/members`;
  }

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: email,
    subject: "!ברוך הבא למיאל 🎉",
    html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                    <span style="font-size: 32px;">🎉</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                    !ברוך הבא למיאל
                </h1>
            </div>
            
            <!-- Content -->
            <div dir="rtl" style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px; line-height: 1.4;">
                    היי ${name}! 🍯
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    אנחנו שמחים שהצטרפת למיאל! עכשיו אתה יכול להתחיל להכיר אנשים מדהימים ולהתחיל את המסע שלך למציאת אהבה.
                </p>
                
                <div style="background-color: #f9fafb; padding: 24px; border-radius: 12px; margin: 24px 0;">
                    <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
                        מה אפשר לעשות עכשיו?
                    </h3>
                    <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; text-align: right; padding-right: 20px;">
                        <li style="margin-bottom: 8px;">✅ השלם את הפרופיל שלך</li>
                        <li style="margin-bottom: 8px;">✅ גלה אנשים מדהימים בקרבת מקום</li>
                        <li style="margin-bottom: 8px;">✅ שלח הודעות וצור קשרים</li>
                        <li style="margin-bottom: 8px;">✅ שתף סיפורים וצילומים</li>
                    </ul>
                </div>
                
                <a href="${membersLink}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); 
                          color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
                          transition: all 0.2s ease;">
                    התחל להכיר אנשים
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
                    אם יש לך שאלות, אנחנו כאן לעזור! פשוט שלח לנו הודעה.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    עם המון אהבה, צוות <strong style="color: #f97316;">מיאל</strong> 💝
                </p>
            </div>
            
        </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${baseUrl}/reset-password?token=${token}`;

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: email,
    subject: "איפוס סיסמה - Miel",
    html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                    <span style="font-size: 32px;">🔐</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                    איפוס סיסמה
                </h1>
            </div>
            
            <!-- Content -->
            <div dir="rtl" style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px; line-height: 1.4;">
                    בקשה לאיפוס סיסמה
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                    קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור למטה כדי ליצור סיסמה חדשה.
                </p>
                
                <a href="${link}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); 
                          color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
                          transition: all 0.2s ease;">
                    אפס את הסיסמה
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
                    לא ביקשת איפוס? אין בעיה - פשוט התעלם מהמייל הזה
                </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    עם המון אהבה, צוות <strong style="color: #f97316;">מיאל</strong> 💝
                </p>
            </div>
            
        </div>
    `,
  });
}

export async function sendNewMatchEmail(
  recipientEmail: string,
  recipientName: string,
  matchName: string,
  matchId: string
) {
  let matchLink = "";

  if (process.env.NODE_ENV === "development") {
    // Running locally
    matchLink = `http://localhost:3000/messages/${matchId}`;
  } else {
    // Running in production
    matchLink = `${baseUrl}/messages/${matchId}`;
  }

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: recipientEmail,
    subject: `🎉 יש לך התאמה חדשה עם ${matchName}!`,
    html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                    <span style="font-size: 32px;">🎉</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                    התאמה חדשה!
                </h1>
            </div>
            
            <!-- Content -->
            <div dir="rtl" style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px; line-height: 1.4;">
                    היי ${recipientName}! 🎊
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    מזל טוב! יש לך התאמה חדשה עם <strong style="color: #f97316;">${matchName}</strong>! שניכם אהבתם אחד את השני וזה אומר שמשהו מיוחד עלול להתחיל כאן 💕
                </p>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                    זה הזמן המושלם להתחיל שיחה ולהכיר אחד את השני טוב יותר!
                </p>
                
                <a href="${matchLink}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); 
                          color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
                          transition: all 0.2s ease;">
                    התחל לשוחח
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
                    אל תשאיר אותם ממתינים יותר מדי זמן - הודעה ראשונה יכולה לעשות את כל ההבדל!
                </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    עם המון אהבה, צוות <strong style="color: #f97316;">מיאל</strong> 💝
                </p>
            </div>
            
        </div>
    `,
  });
}

export async function sendNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  senderId: string,
  senderGender?: string
) {
  let messageLink = "";

  if (process.env.NODE_ENV === "development") {
    // Running locally
    messageLink = `http://localhost:3000/members/${senderId}/chat`;
  } else {
    // Running in production
    messageLink = `${baseUrl}/members/${senderId}/chat`;
  }

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: recipientEmail,
    subject: `💬 ${senderName} שלח לך הודעה`,
    html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px 16px 0 0;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
                    <span style="font-size: 32px;">💬</span>
                </div>
                <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                    הודעה חדשה!
                </h1>
            </div>
            
            <!-- Content -->
            <div dir="rtl" style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px; line-height: 1.4;">
                    היי ${recipientName}! 📩
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    <strong style="color: #f97316;">${senderName}</strong> שלח לך הודעה חדשה!
                </p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 24px 0; border-right: 4px solid #f97316;">
                    <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
                        "${messagePreview}..."
                    </p>
                </div>
                
                <a href="${messageLink}"
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); 
                          color: white; padding: 16px 32px; font-size: 16px; font-weight: 600; 
                          text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
                          transition: all 0.2s ease;">
                    קרא את ההודעה
                </a>
                
               <p style="color: #9ca3af; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
                    ${
                      senderGender === "female"
                        ? "היא עשתה את הצעד הראשון 😉 עכשיו תורך לענות!"
                        : senderGender === "male"
                          ? "הוא עשה את הצעד הראשון 😉 עכשיו תורך לענות!"
                          : "אל תשאיר את ההודעה תלויה באוויר תגיב עכשיו ותמשיך את השיחה!"
                    }
               </p>

            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 30px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    עם המון אהבה, צוות <strong style="color: #f97316;">מיאל</strong> 💝
                </p>
            </div>
            
        </div>
    `,
  });
}
