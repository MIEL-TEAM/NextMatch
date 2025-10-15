"use client";

import React from "react";
import { MdVerified } from "react-icons/md";

interface VerifiedRibbonProps {
  className?: string;
}

export default function VerifiedRibbon({
  className = "",
}: VerifiedRibbonProps) {
  return (
    <div
      className={`absolute top-0 right-0 z-30 pointer-events-none ${className}`}
      style={{ width: "60px", height: "60px", overflow: "hidden" }}
    >
      <div
        className="absolute bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
        style={{
          width: "90px",
          height: "22px",
          top: "12px",
          right: "-22px",
          transform: "rotate(45deg)",
          transformOrigin: "center",
        }}
      >
        <div className="flex items-center justify-center gap-1 h-full text-[10px] font-bold">
          <MdVerified className="w-4 h-4" />
          <span className="tracking-wide">מאומת</span>
        </div>
      </div>
    </div>
  );
}
