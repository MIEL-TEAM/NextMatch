// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-sm">
          <span className="text-4xl">🍯</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          אופס… הלכת לאיבוד
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          לפעמים יוצאים לדייט ומגיעים למקום הלא נכון, זה קורה גם לטובים ביותר 😉
          האהבה עדיין מחכה לך פשוט לא כאן.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            חזרה למיאל 💛
          </Link>

          <Link
            href="/members"
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            או חפש התאמות חדשות
          </Link>
        </div>
      </div>
    </div>
  );
}
