"use client";

import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MemberImageCarouselProps {
  images: Array<{ url: string; id: string }>;
  children: (currentImage: { url: string; id: string }) => React.ReactNode;
}

export default function MemberImageCarousel({
  images,
  children,
}: MemberImageCarouselProps) {
  const uniqueImages = images.reduce((unique, img) => {
    if (!img || !img.url) return unique;

    if (!unique.some((item) => item.url === img.url)) {
      unique.push(img);
    }

    return unique;
  }, [] as Array<{ url: string; id: string }>);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToIndex = (newIndex: number) => {
    if (uniqueImages.length <= 1) return;

    let validIndex = newIndex;
    if (validIndex < 0) validIndex = uniqueImages.length - 1;
    if (validIndex >= uniqueImages.length) validIndex = 0;

    setCurrentIndex(validIndex);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => goToIndex(currentIndex + 1),
    onSwipedRight: () => goToIndex(currentIndex - 1),
    trackMouse: true,
  });

  if (uniqueImages.length === 0) {
    return children({ url: "/images/user.png", id: "default" });
  }

  const safeIndex = Math.min(currentIndex, uniqueImages.length - 1);
  const currentImage = uniqueImages[safeIndex];

  return (
    <div {...handlers} className="relative w-full h-full overflow-hidden group">
      {children(currentImage)}

      {uniqueImages.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToIndex(currentIndex - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 
              bg-black/10 hover:bg-black/30 backdrop-blur-sm rounded-full p-1.5
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              transform hover:scale-105 active:scale-95"
            aria-label="Previous image"
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
              bg-black/10 hover:bg-black/30 backdrop-blur-sm rounded-full p-1.5
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              transform hover:scale-105 active:scale-95"
            aria-label="Next image"
            type="button"
          >
            <ChevronRight className="text-white w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {uniqueImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === safeIndex
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${idx + 1}`}
                type="button"
              />
            ))}
          </div>

          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full z-30 text-white font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span dir="rtl">
              {safeIndex + 1} מתוך {uniqueImages.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
