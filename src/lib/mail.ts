import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_UR;

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${baseUrl}/verify-email?token=${token}`;

  return resend.emails.send({
    from: "mail@miel-love.com",
    to: email,
    subject: "אימות כתובת האימייל שלך - ברוך הבא ל-Miel!",
    html: `
        <div dir="rtl" style="text-align: center; font-family: Arial, sans-serif; background: linear-gradient(to bottom, #FCEABB, #F8B500, #E89C27); padding: 30px; border-radius: 15px; max-width: 600px; margin: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
            
            <h1 style="color: #5C432D; font-size: 28px; margin-bottom: 10px;">
                👋 ברוך הבא ל-<span dir="ltr" style="color: #5C432D; font-weight: bold;">Miel</span>!
            </h1>
            
            <p style="font-size: 18px; color: #5C432D; margin-bottom: 20px;">
                כדי להשלים את ההרשמה שלך וליהנות מכל מה שיש לנו להציע, עליך לאמת את כתובת האימייל שלך.
            </p>
            
            <p style="font-size: 16px; color: #5C432D; margin-bottom: 25px;">
                לחץ על הכפתור למטה כדי לאשר את חשבונך:
            </p>
            
            <a href="${link}" 
               style="display: inline-block; background-color: #D99152; color: #fff; padding: 15px 30px; 
                      font-size: 20px; font-weight: bold; text-decoration: none; border-radius: 8px; 
                      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);">
                ✅ אשר את האימייל שלך
            </a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #5C432D;">
                אם לא נרשמת ל-<span dir="ltr">Miel</span>, פשוט התעלם מהמייל הזה.
            </p>
            
            <p style="font-size: 14px; color: #5C432D; margin-top: 10px; font-weight: bold;">
                צוות <span dir="ltr">Miel</span> 💖
            </p>
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
            <div dir="rtl" style="text-align: center; font-family: Arial, sans-serif; background: linear-gradient(to bottom, #FCEABB, #F8B500, #E89C27); padding: 30px; border-radius: 15px; max-width: 600px; margin: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
                
                <h1 style="color: #5C432D; font-size: 28px; margin-bottom: 10px;">
                    🔑 בקשת איפוס סיסמה
                </h1>
                
                <p style="font-size: 18px; color: #5C432D; margin-bottom: 20px;">
                    קיבלנו בקשה לאיפוס הסיסמה שלך ב-<span dir="ltr" style="color: #5C432D; font-weight: bold;">Miel</span>.
                </p>
                
                <p style="font-size: 16px; color: #5C432D; margin-bottom: 25px;">
                    לחץ על הכפתור למטה כדי להגדיר סיסמה חדשה:
                </p>
                
                <a href="${link}" 
                   style="display: inline-block; background-color: #D99152; color: #fff; padding: 15px 30px; 
                          font-size: 20px; font-weight: bold; text-decoration: none; border-radius: 8px; 
                          box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);">
                    🔄 אפס את הסיסמה שלך
                </a>
                
                <p style="margin-top: 30px; font-size: 14px; color: #5C432D;">
                    אם לא ביקשת איפוס סיסמה, פשוט התעלם מהמייל הזה.
                </p>
                
                <p style="font-size: 14px; color: #5C432D; margin-top: 10px; font-weight: bold;">
                    צוות <span dir="ltr">Miel</span> 💖
                </p>
            </div>
        `,
  });
}
