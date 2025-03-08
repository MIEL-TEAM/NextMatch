"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@nextui-org/react";
import { Clock } from "lucide-react";

interface InlineEmptyStateProps {
  message?: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

const InlineEmptyState: React.FC<InlineEmptyStateProps> = ({
  message,
  subMessage,
  icon = <Clock size={48} className="text-amber-500" />,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full my-4 px-2"
    >
      <Card className="py-10 px-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-amber-500">{icon}</div>
          <h3 className="text-xl font-bold text-orange-700 mb-2">{message}</h3>
          <p className="text-gray-600 max-w-md">{subMessage}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default InlineEmptyState;
