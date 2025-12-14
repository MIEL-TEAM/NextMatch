import React from "react";
import {
  FiHeart,
  FiFilter,
  FiZap,
  FiMessageCircle,
  FiSearch,
  FiEye,
  FiBarChart,
  FiLock,
} from "react-icons/fi";
import { Feature } from "../types";

// Free plan - very limited features
export function createFreeFeatures(): Feature[] {
  return [
    { text: "מגבלת לייקים יומית", icon: <FiLock size={18} /> },
    { text: "לא רואה מי אהב אותך", icon: <FiLock size={18} /> },
    { text: "אין בוסטים", icon: <FiLock size={18} /> },
    { text: "אין סינון מתקדם", icon: <FiLock size={18} /> },
  ];
}

// Basic plan - entry level premium
export function createBasicFeatures(boostCount: number = 5): Feature[] {
  return [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    {
      text: (
        <>
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            סינון מתקדם
          </span>{" "}
          למציאת ההתאמה המושלמת
        </>
      ),
      icon: <FiFilter size={18} />,
    },
    {
      text: `${boostCount} בוסטים חודשיים לפרופיל שלך`,
      icon: <FiZap size={18} />,
    },
    {
      text: (
        <>
          ללא{" "}
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            מגבלת הודעות ולייקים
          </span>
        </>
      ),
      icon: <FiMessageCircle size={18} />,
    },
  ];
}

// Popular plan - most value
export function createPopularFeatures(boostCount: number = 10): Feature[] {
  return [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    {
      text: (
        <>
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            סינון מתקדם
          </span>{" "}
          למציאת ההתאמה המושלמת
        </>
      ),
      icon: <FiFilter size={18} />,
    },
    {
      text: `${boostCount} בוסטים חודשיים לפרופיל שלך`,
      icon: <FiZap size={18} />,
    },
    {
      text: (
        <>
          ללא{" "}
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            מגבלת הודעות ולייקים
          </span>
        </>
      ),
      icon: <FiMessageCircle size={18} />,
    },
    {
      text: (
        <>
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            תעדוף
          </span>{" "}
          במסך החיפוש
        </>
      ),
      icon: <FiSearch size={18} />,
    },
    { text: "ראה מי צפה בסטורי שלך", icon: <FiBarChart size={18} /> },
  ];
}

// Annual plan - everything included
export function createAnnualFeatures(boostCount: number = 15): Feature[] {
  return [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    {
      text: (
        <>
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            סינון מתקדם
          </span>{" "}
          למציאת ההתאמה המושלמת
        </>
      ),
      icon: <FiFilter size={18} />,
    },
    {
      text: `${boostCount} בוסטים חודשיים לפרופיל שלך`,
      icon: <FiZap size={18} />,
    },
    {
      text: (
        <>
          ללא{" "}
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            מגבלת הודעות ולייקים
          </span>
        </>
      ),
      icon: <FiMessageCircle size={18} />,
    },
    {
      text: (
        <>
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            תעדוף
          </span>{" "}
          במסך החיפוש
        </>
      ),
      icon: <FiSearch size={18} />,
    },
    { text: "ראה מי צפה בסטורי שלך", icon: <FiBarChart size={18} /> },
    { text: "ראה מי צפה בפרופיל שלך", icon: <FiEye size={18} /> },
  ];
}

export function getAllFeatures() {
  return {
    free: createFreeFeatures(),
    basic: createBasicFeatures(5),
    popular: createPopularFeatures(10),
    annual: createAnnualFeatures(15),
  };
}
