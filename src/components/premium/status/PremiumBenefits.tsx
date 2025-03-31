import React from "react";
import { FiCheck } from "react-icons/fi";

interface PremiumBenefitsProps {
  benefits?: string[];
}

export function PremiumBenefits({
  benefits = [
    "ראה מי אהב את הפרופיל שלך",
    "סינון מתקדם למציאת ההתאמה המושלמת",
    "גישה ללא הגבלה להודעות ולייקים",
    "תעדוף במסך החיפוש",
  ],
}: PremiumBenefitsProps) {
  return (
    <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-100/50">
      <h3 className="text-lg font-bold text-amber-800 mb-2 text-right">
        היתרונות שלך:
      </h3>
      <ul className="space-y-2 text-right">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center text-amber-700">
            <span>{benefit}</span>
            <FiCheck className="ml-2 text-amber-500" />
          </li>
        ))}
      </ul>
    </div>
  );
}
