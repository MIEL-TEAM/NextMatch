"use client";

import Icon from "@/lib/table/Icon";
import { StoryReactionsProps } from "@/types/stories";

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
        <Icon name="comment-dots" className="size-4 bg-white" />
        <span className="text-sm">Reply</span>
      </button>
    </div>
  );
}
