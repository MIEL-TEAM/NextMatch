"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselProps } from "@/types/members";

export default function Carousel<T>({
  items,
  children,
  onIndexChange,
  enableSwipe = true,
  showArrows = true,
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (onIndexChange && prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  const goToIndex = (newIndex: number) => {
    if (items.length <= 1) return;
    let validIndex = newIndex;
    if (validIndex < 0) validIndex = items.length - 1;
    if (validIndex >= items.length) validIndex = 0;
    setCurrentIndex(validIndex);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => enableSwipe && goToIndex(currentIndex + 1),
    onSwipedRight: () => enableSwipe && goToIndex(currentIndex - 1),
    trackMouse: true,
  });

  if (items.length === 0) return null;

  const currentItem = items[Math.min(currentIndex, items.length - 1)];

  return (
    <div {...handlers} className="relative w-full h-full overflow-hidden group">
      {children(currentItem, currentIndex)}

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToIndex(currentIndex - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 
              bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              transform hover:scale-105 active:scale-95"
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft className="text-white w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToIndex(currentIndex + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 
              bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              transform hover:scale-105 active:scale-95"
            aria-label="Next"
            type="button"
          >
            <ChevronRight className="text-white w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
