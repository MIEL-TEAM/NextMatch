"use client";

import Image from "next/image";

export default function MielHeader() {
  return (
    <header className="fixed top-6 left-0 w-full z-50">
      <div className="relative w-full px-4 py-3" style={{ direction: "rtl" }}>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-white text-2xl font-semibold">Miel</span>
          <Image
            src="/images/icons/miel.png"
            alt="Miel logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
