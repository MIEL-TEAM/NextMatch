// premium/features/createFeaturesList.tsx
import React from "react";
import {
  FiHeart,
  FiFilter,
  FiZap,
  FiMessageCircle,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import { Feature } from "../types";

// Creates the basic features list
export function createBasicFeatures(boostCount: number = 5): Feature[] {
  return [
    { text: "ראה מי אהב את הפרופיל שלך", icon: <FiHeart size={18} /> },
    { text: "סינון מתקדם למציאת ההתאמה המושלמת", icon: <FiFilter size={18} /> },
    {
      text: `${boostCount} בוסטים חודשיים לפרופיל שלך`,
      icon: <FiZap size={18} />,
    },
    { text: "ללא מגבלת הודעות ולייקים", icon: <FiMessageCircle size={18} /> },
  ];
}

// Creates the popular features list
export function createPopularFeatures(boostCount: number = 10): Feature[] {
  return [
    ...createBasicFeatures(boostCount),
    { text: "תעדוף במסך החיפוש", icon: <FiSearch size={18} /> },
  ];
}

// Creates the annual features list
export function createAnnualFeatures(boostCount: number = 15): Feature[] {
  return [
    ...createPopularFeatures(boostCount),
    { text: "ראה מי צפה בפרופיל שלך", icon: <FiEye size={18} /> },
  ];
}

// Get premium features for all plan types
export function getAllFeatures() {
  return {
    basic: createBasicFeatures(5),
    popular: createPopularFeatures(10),
    annual: createAnnualFeatures(15),
  };
}
