"use client";

import { useState } from "react";
import { Send, Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-12">
      <div>
        <div className="bg-white/80 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            אנחנו כאן כדי לעזור
          </h2>
          <p className="text-gray-700 mb-6">
            יש לך שאלות או הצעות? נשמח לשמוע ממך. צוות התמיכה שלנו זמין כדי
            לענות על כל שאלה שיש לך לגבי מיאל.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-amber-500 shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">אימייל</h3>
                <p className="text-gray-700">contact@miel.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-amber-500 shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">טלפון</h3>
                <p className="text-gray-700">03-1234567</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageSquare className="text-amber-500 shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">
                  צ&apos;אט באפליקציה
                </h3>
                <p className="text-gray-700">זמין 24/7 דרך האפליקציה</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">
            דיווח על התנהגות לא ראויה
          </h2>
          <p className="text-gray-700">
            אם נתקלת בהתנהגות מטרידה או לא ראויה מצד משתמש אחר, נא לדווח מיד דרך
            האפליקציה או באמצעות שליחת דוא&quot;ל ל:
          </p>
          <p className="font-medium text-amber-800 mt-2 text-center">
            contact@miel.com
          </p>
        </div>
      </div>

      <div className="bg-white/80 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-6">
          שלח לנו הודעה
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-amber-800 font-medium mb-1"
            >
              שם מלא
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-amber-800 font-medium mb-1"
            >
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-amber-800 font-medium mb-1"
            >
              נושא
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">בחר נושא</option>
              <option value="support">תמיכה טכנית</option>
              <option value="feedback">משוב על האפליקציה</option>
              <option value="billing">שאלות לגבי חיוב</option>
              <option value="report">דיווח על משתמש</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-amber-800 font-medium mb-1"
            >
              הודעה
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {isSubmitting ? (
                "שולח..."
              ) : (
                <>
                  שלח הודעה <Send className="mr-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {submitStatus === "success" && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg mt-4 text-center">
              ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.
            </div>
          )}

          {submitStatus === "error" && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg mt-4 text-center">
              אירעה שגיאה בשליחת ההודעה. אנא נסה שוב מאוחר יותר.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
