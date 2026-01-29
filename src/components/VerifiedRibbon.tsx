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
      className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-1 shadow-lg ${className}`}
    >
      <MdVerified className="w-4 h-4" />
    </div>
  );
}
