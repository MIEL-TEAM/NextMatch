"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
  createdAt: Date;
}

interface AIChatMessageProps {
  message: Message;
  isLatest: boolean;
}

export function AIChatMessage({ message }: AIChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600"
              : "bg-gradient-to-br from-amber-400 to-orange-500"
          }`}
        >
          <span className="text-sm">{isUser ? "👤" : "🤖"}</span>
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1">
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-blue-500 text-white rounded-tr-sm"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm shadow-md"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Metadata (if any - like match suggestions) */}
            {message.metadata && message.metadata.matches && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium opacity-80 mb-2">
                  התאמות שמצאתי עבורך:
                </p>
                {message.metadata.matches.map((match: any) => (
                  <a
                    key={match.userId}
                    href={`/members/${match.userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {match.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {match.age} • {match.city}
                        </p>
                      </div>
                      {match.matchScore && (
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          {Math.round(match.matchScore)}%
                        </span>
                      )}
                    </div>
                    {match.reason && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {match.reason}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-xs text-gray-500 dark:text-gray-400 px-2 ${
              isUser ? "text-left" : "text-right"
            }`}
          >
            {format(new Date(message.createdAt), "HH:mm", { locale: he })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
