import React from "react";
import {
  FiHeart,
  FiFilter,
  FiZap,
  FiMessageCircle,
  FiSearch,
  FiEye,
  FiBarChart,
} from "react-icons/fi";
import { Feature } from "../types";

// BASIC
export function createBasicFeatures(boostCount: number = 5): Feature[] {
  return [
    {
      text: "ראה מי אהב את הפרופיל שלך",
      icon: <FiHeart size={18} />,
      highlight: true,
    },
    {
      text: "סינון מתקדם למציאת ההתאמה המושלמת",
      icon: <FiFilter size={18} />,
      highlight: true,
    },
    {
      text: `${boostCount} בוסטים חודשיים לפרופיל שלך`,
      icon: <FiZap size={18} />,
    },
    { text: "ללא מגבלת הודעות ולייקים", icon: <FiMessageCircle size={18} /> },
  ];
}

// POPULAR
export function createPopularFeatures(boostCount: number = 10): Feature[] {
  return [
    ...createBasicFeatures(boostCount),
    {
      text: "תעדוף במסך החיפוש",
      icon: <FiSearch size={18} />,
      highlight: true,
    },
    {
      text: "ראה מי צפה בסטורי שלך",
      icon: <FiBarChart size={18} />,
      highlight: true,
    },
  ];
}

// ANNUAL
export function createAnnualFeatures(boostCount: number = 15): Feature[] {
  return [
    ...createPopularFeatures(boostCount),
    {
      text: "ראה מי צפה בפרופיל שלך",
      icon: <FiEye size={18} />,
      highlight: true,
    },
  ];
}

// EXPORT ALL
export function getAllFeatures() {
  return {
    basic: createBasicFeatures(5),
    popular: createPopularFeatures(10),
    annual: createAnnualFeatures(15),
  };
}
