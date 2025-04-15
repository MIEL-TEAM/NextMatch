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

  // Set up swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => goToIndex(currentIndex + 1),
    onSwipedRight: () => goToIndex(currentIndex - 1),
    trackMouse: true,
  });

  // Safety check - if we somehow have no valid images
  if (uniqueImages.length === 0) {
    return children({ url: "/images/user.png", id: "default" });
  }

  // Safety check - if our current index is out of bounds
  const safeIndex = Math.min(currentIndex, uniqueImages.length - 1);
  const currentImage = uniqueImages[safeIndex];

  return (
    <div {...handlers} className="relative group w-full h-full overflow-hidden">
      {children(currentImage)}

      {uniqueImages.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToIndex(currentIndex - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 
              bg-black/40 backdrop-blur-sm rounded-full p-2.5
              hover:bg-black/60 transition-all duration-300
              opacity-0 group-hover:opacity-100
              transform hover:scale-110 active:scale-95
              shadow-lg hover:shadow-xl"
            aria-label="Previous image"
            type="button"
          >
            <ChevronLeft className="text-white w-5 h-5" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToIndex(currentIndex + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 
              bg-black/40 backdrop-blur-sm rounded-full p-2.5
              hover:bg-black/60 transition-all duration-300
              opacity-0 group-hover:opacity-100
              transform hover:scale-110 active:scale-95
              shadow-lg hover:shadow-xl"
            aria-label="Next image"
            type="button"
          >
            <ChevronRight className="text-white w-5 h-5" />
          </button>

          {/* Indicator dots - exactly like the reference image */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-50">
            {uniqueImages.map((_, idx) => (
              <button
                key={`indicator-${_.id}-${idx}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToIndex(idx);
                }}
                aria-label={`Go to image ${idx + 1}`}
                aria-current={idx === currentIndex ? "true" : "false"}
                className="focus:outline-none mx-1"
                type="button"
              >
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                ></div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
