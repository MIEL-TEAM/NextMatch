"use client";

import { motion } from "framer-motion";
import Icon, { IconNames } from "@/lib/table/Icon";

interface AIQuickActionsProps {
  onAction: (prompt: string) => void;
  compact?: boolean;
}

const quickActions: { icon: IconNames; label: string; prompt: string; color: string }[] = [
  {
    icon: "magnifying-glass",
    label: "מצא התאמות",
    prompt:
      "מצא לי את ההתאמות הכי טובות עבורי בהתבסס על כל ההעדפות והפעילות שלי",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: "comment-dots",
    label: "פתיח לשיחה",
    prompt: "תן לי 3 פתיחי שיחה מקוריים ואישיים שבטוח יעבדו",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: "chart-bar",
    label: "הצלחות שלי",
    prompt:
      "הצג לי ניתוח מלא של הפעילות וההתקדמות שלי - לייקים, הודעות, סיכויים",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: "bolt",
    label: "שפר פרופיל",
    prompt: "תן לי המלצות קונקרטיות איך לשפר את הפרופיל שלי למקסימום התאמות",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "heart",
    label: "טיפים מקצועיים",
    prompt: "תן לי טיפים מקצועיים איך להצליח בדייטים ולמצוא את האחת/האחד",
    color: "from-red-500 to-pink-500",
  },
];

export function AIQuickActions({
  onAction,
  compact = false,
}: AIQuickActionsProps) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.prompt)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors"
          >
            <Icon name={action.icon} className="size-3.5 bg-gray-700 dark:bg-gray-300" />
            {action.label}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {quickActions.map((action, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(action.prompt)}
          className={`relative p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-2 text-center">
            <Icon name={action.icon} className="size-6 bg-white" />
            <span className="text-xs font-medium">{action.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
