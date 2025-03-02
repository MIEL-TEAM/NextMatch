"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Photo } from "@prisma/client";
import { transformImageUrl } from "@/lib/util";
import { Image } from "@nextui-org/react";
import { useSwipeable } from "react-swipeable";

type MemberImageCarouselProps = {
  photos: Photo[];
  defaultImageUrl?: string | null;
  preventNavigate?: (event: React.MouseEvent) => void;
};

export default function MemberImageCarousel({
  photos,
  defaultImageUrl,
  preventNavigate,
}: MemberImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setAllImages([defaultImageUrl || "/images/user.png"]);
      return;
    }

    const urls = photos.map(
      (photo) => transformImageUrl(photo.url) ?? "/images/user.png"
    );

    setAllImages(urls);
  }, [photos, defaultImageUrl]);

  const handlePrev = (e: React.MouseEvent) => {
    if (preventNavigate) preventNavigate(e);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    if (preventNavigate) preventNavigate(e);
    setCurrentIndex((prevIndex) =>
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext({} as React.MouseEvent),
    onSwipedRight: () => handlePrev({} as React.MouseEvent),
    trackMouse: false,
  });

  if (allImages.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full" {...swipeHandlers}>
      <Image
        isZoomed
        alt="Member photo"
        src={allImages[currentIndex]}
        className="w-full h-full object-cover"
        removeWrapper
      />

      {allImages.length > 1 && (
        <>
          <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1 z-20">
            {allImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentIndex === index ? "bg-white" : "bg-white/50"
                }`}
                onClick={(e) => {
                  if (preventNavigate) preventNavigate(e);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 z-30"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 z-30"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
