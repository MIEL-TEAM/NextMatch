"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface PremiumMarkProps {
  isActivePremium: boolean;
}

export default function PremiumMark({ isActivePremium }: PremiumMarkProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dismiss on outside click (mobile tap-away)
  useEffect(() => {
    if (!visible) return;
    const handle = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [visible]);

  if (!isActivePremium) return null;

  const reposition = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.top, left: r.left + r.width / 2 });
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block ml-1.5 cursor-default"
        onMouseEnter={() => {
          reposition();
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!visible) reposition();
          setVisible((v) => !v);
        }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-orange-500 select-none"
          style={{ opacity: 0.85 }}
        >
          M+
        </span>
      </span>

      {mounted &&
        createPortal(
          <div
            role="tooltip"
            className={`pointer-events-none fixed z-[9999] w-max max-w-[240px] bg-stone-900 text-white text-center text-[12px] leading-snug rounded-md px-3 py-2 shadow-md transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, calc(-100% - 10px))",
            }}
          >
            חבר Miel+ נהנה מחשיפה גבוהה יותר וכלים חכמים ללא מגבלה
            <span className="block text-[11px] text-white/60 mt-1">
              סטטוס זה זמין למנויי Premium פעילים
            </span>
            {/* Arrow */}
            <span
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1c1917",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
