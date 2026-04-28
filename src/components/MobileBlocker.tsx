import Image from "next/image";

export default function MobileBlocker() {
  return (
    <div className="md:hidden fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50 via-white to-pink-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8 relative flex items-end justify-center gap-3">
        <div className="relative w-24 h-32 rounded-2xl overflow-hidden shadow-xl rotate-[-6deg] border-2 border-white">
          <Image
            src="/images/f7.jpg"
            alt="Miel"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="relative w-28 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white z-10">
          <Image
            src="/images/m1.jpg"
            alt="Miel"
            fill
            className="object-cover"
            sizes="112px"
          />
        </div>
        <div className="relative w-24 h-32 rounded-2xl overflow-hidden shadow-xl rotate-[6deg] border-2 border-white">
          <Image
            src="/images/f6.jpg"
            alt="Miel"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-center gap-2">
        <Image
          src="/images/icons/Logo.png"
          alt="Miel Logo"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="text-2xl font-bold text-orange-500">Miel</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">
        מיאל זמינה רק במחשב
      </h1>
      <p className="text-gray-500 text-base leading-relaxed max-w-xs">
        האפליקציה שלנו מותאמת לחוויית דסקטופ מלאה.
        <br />
        פתח אותה מהמחשב שלך ומצא את ההתאמה המושלמת 💛
      </p>

      <div className="mt-8 px-6 py-3 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
        עבור למחשב כדי להמשיך
      </div>
    </div>
  );
}
