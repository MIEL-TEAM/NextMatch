"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiX, FiSend, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { AIChatMessage } from "./AIChatMessage";
import { AIQuickActions } from "./AIQuickActions";
import { AITypingIndicator } from "./AITypingIndicator";
import AppModal from "@/components/AppModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
  createdAt: Date;
}

interface AIChatModalProps {
  userId: string;
  isPremium: boolean;
  onClose: () => void;
}

export function AIChatModal({ userId, isPremium, onClose }: AIChatModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(isPremium ? 30 : 5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isQuotaReached = remaining !== null && remaining <= 0;

  const loadConversationHistory = useCallback(async () => {
    try {
      const isForbiddenRoute =
        pathname === "/" ||
        pathname === "/premium" ||
        pathname === "/login" ||
        pathname === "/register";

      const fetchPromises = [
        fetch(`/api/ai-assistant/history?userId=${userId}`),
      ];

      if (!isForbiddenRoute) {
        fetchPromises.push(
          fetch(`/api/ai-assistant/insights?userId=${userId}`)
        );
      }

      const [historyResponse, insightsResponse] =
        await Promise.all(fetchPromises);

      let historyData = null;
      if (historyResponse.ok) {
        historyData = await historyResponse.json();
        setMessages(historyData.messages || []);
        if (historyData.limit !== undefined) setLimit(historyData.limit);
        if (historyData.remaining !== undefined) setRemaining(historyData.remaining);
      }

      // Show proactive insight if available (skip on forbidden routes)
      if (insightsResponse && insightsResponse.ok) {
        const insightData = await insightsResponse.json();
        if (insightData.hasInsights && insightData.insight && historyData) {
          // Add insight as a system message if no recent messages
          if (historyData.messages.length === 0) {
            setMessages([
              {
                id: "insight-" + Date.now(),
                role: "assistant",
                content: `שלום! 👋\n\n${insightData.insight}`,
                createdAt: new Date(),
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId, pathname]);

  // Load conversation history
  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isQuotaReached) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: content.trim(),
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        if (data.error === "AI_QUOTA_REACHED") {
          setRemaining(0);
          setShowUpgradeModal(true);
          return;
        }
        throw new Error("Rate limited");
      }

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.messageId || Date.now().toString(),
        role: "assistant",
        content: data.content,
        metadata: data.metadata,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      if (data.limit !== undefined) setLimit(data.limit);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "מצטער, נתקלתי בבעיה. אנא נסה שוב.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch("/api/ai-assistant/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setMessages([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to clear conversation:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const isFirstMessage = messages.length === 0 && !isLoadingHistory;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 h-screen overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold">העוזר האישי שלך</h2>
                <p className="text-xs text-white/80">
                  {isPremium
                    ? "♾️ שימוש ללא הגבלה"
                    : remaining !== null
                    ? `${limit - remaining}/${limit} שאילתות היום`
                    : `0/${limit} שאילתות היום`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="מחק שיחה"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800 min-h-0">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <FiRefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Welcome Message */}
                {isFirstMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 py-8"
                  >
                    <div className="text-6xl">💕</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      שלום! אני כאן לעזור לך
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      אני מכיר את ההעדפות שלך ויכול לעזור לך למצוא את ההתאמה
                      המושלמת, לשפר את הפרופיל שלך, ולתת טיפים לשיחות.
                    </p>
                    <div className="pt-4">
                      <AIQuickActions onAction={handleQuickAction} />
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                  <AIChatMessage
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                  />
                ))}

                {/* Typing Indicator */}
                {isLoading && <AITypingIndicator />}

                {/* Stage 1: Soft Awareness (remaining === 2) */}
                {!isPremium && remaining === 2 && !isLoading && (
                  <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
                    נשארו לך 2 הודעות חכמות להיום
                  </div>
                )}

                {/* Stage 2: Last Message Warning (remaining === 1) */}
                {!isPremium && remaining === 1 && !isLoading && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
                    <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      זו ההודעה האחרונה שלך להיום
                    </span>
                    <button
                      onClick={() => router.push("/premium")}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium underline underline-offset-2 shrink-0"
                    >
                      ללא הגבלה עם Premium
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Actions (shown after first message) */}
          {!isFirstMessage && messages.length > 0 && !isLoading && (
            <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
              <AIQuickActions onAction={handleQuickAction} compact />
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0"
          >
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || isQuotaReached}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <FiSend className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isQuotaReached ? "הגעת למגבלה היומית" : "שאל אותי כל דבר..."}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                disabled={isLoading || isQuotaReached}
              />
            </div>
          </form>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AppModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        header="מחיקת שיחה"
        body={
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <FiTrash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                האם אתה בטוח?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                פעולה זו תמחק את כל ההיסטוריה של השיחה שלך עם העוזר האישי.
                <br />
                לא ניתן לשחזר את השיחה לאחר המחיקה.
              </p>
            </div>
          </div>
        }
        footerButtons={[
          {
            children: "ביטול",
            color: "default",
            variant: "bordered",
            onPress: cancelDelete,
          },
          {
            children: "מחק",
            color: "danger",
            variant: "solid",
            onPress: confirmDelete,
          },
        ]}
      />

      {/* Stage 3: Upgrade Modal (quota reached) */}
      <AppModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        header="רוצה להמשיך את השיחה בלי מגבלה?"
        body={
          <ul className="space-y-3 py-2">
            {["AI ללא הגבלה", "לייקים ללא הגבלה", "עדיפות בפרופיל"].map(
              (benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm font-medium">{benefit}</span>
                </li>
              )
            )}
          </ul>
        }
        footerButtons={[
          {
            children: "אמשיך מחר",
            color: "default",
            variant: "bordered",
            onPress: () => setShowUpgradeModal(false),
          },
          {
            children: "שדרג ל-Premium",
            color: "warning",
            variant: "solid",
            onPress: () => {
              setShowUpgradeModal(false);
              router.push("/premium");
            },
          },
        ]}
      />
    </motion.div>
  );
}
