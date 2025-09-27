"use client";

import { FiMessageCircle } from "react-icons/fi";

interface StoryReactionsProps {
  onReaction: (reaction: string) => void;
  onReply: () => void;
}

export function StoryReactions({ onReaction, onReply }: StoryReactionsProps) {
  const reactions = [
    { emoji: "❤️", type: "HEART" },
    { emoji: "🔥", type: "FIRE" },
    { emoji: "😍", type: "LOVE_EYES" },
    { emoji: "👀", type: "EYES" },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => onReaction(reaction.type)}
            className="text-2xl hover:scale-110 transition-transform active:scale-95"
          >
            {reaction.emoji}
          </button>
        ))}
      </div>

      <button
        onClick={onReply}
        className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-full hover:bg-opacity-30 transition-colors"
      >
        <FiMessageCircle size={16} />
        <span className="text-sm">Reply</span>
      </button>
    </div>
  );
}
