"use client";

import Icon from "@/lib/table/Icon";
import React from "react";

type LikeButtonProps = {
  loading: boolean;
  hasLiked: boolean;
  toggleLike: (e: React.MouseEvent) => void;
};

export default function LikeButton({
  loading,
  hasLiked,
  toggleLike,
}: LikeButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(e);
  };

  return (
    <>
      {!loading ? (
        <div
          onClick={handleClick}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="relative hover:opacity-80 translate cursor-pointer"
        >
          <Icon name="heart" type="lit" className="size-7 bg-white absolute -top-[2px] -right-[2px]" />
          <Icon name="heart" type="sol" className={`size-6 ${hasLiked ? "bg-rose-500" : "bg-neutral-500/70"}`} />
        </div>
      ) : (
        <Icon name="spinner" className="size-8 bg-white animate-spin" />
      )}
    </>
  );
}
