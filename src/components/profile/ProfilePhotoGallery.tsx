"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type GalleryPhoto = {
    url: string;
    id: string;
};

type ProfilePhotoGalleryProps = {
    photos: GalleryPhoto[];
    isOwnProfile: boolean;
};

// Constants
const IMAGE_WIDTH = 150;
const GAP = 13;
const SCROLL_AMOUNT = IMAGE_WIDTH + GAP;
const SCROLL_THRESHOLD = 5;

export default function ProfilePhotoGallery({
    photos,
    isOwnProfile,
}: ProfilePhotoGalleryProps) {
    const router = useRouter();
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Debounced scroll check for better performance
        let timeoutId: NodeJS.Timeout;
        const checkScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                const maxScrollLeft = scrollWidth - clientWidth;

                setCanScrollLeft(scrollLeft > SCROLL_THRESHOLD);
                setCanScrollRight(scrollLeft < maxScrollLeft - SCROLL_THRESHOLD);
            }, 50);
        };

        // Initial check with proper image load detection
        const checkWhenReady = () => {
            checkScroll();
            // Recheck after potential layout shifts
            requestAnimationFrame(() => {
                setTimeout(checkScroll, 100);
            });
        };

        checkWhenReady();

        container.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);

        return () => {
            clearTimeout(timeoutId);
            container.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [photos]);

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollDelta = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
        container.scrollBy({ left: scrollDelta, behavior: "smooth" });
    };

    if (photos.length === 0) return null;

    return (
        <div className="px-6 mt-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4" dir="rtl">
                    <h3 className="text-xl font-semibold text-default-700">תמונות</h3>
                    {isOwnProfile && (
                        <button
                            onClick={() => router.push(`/members/edit/photos`)}
                            className="text-sm text-[#E37B27] hover:text-[#FFB547] font-medium transition-colors"
                        >
                            ניהול תמונות
                        </button>
                    )}
                </div>

                <div className="relative">
                    {/* Left gradient shadow */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    )}

                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft
                                size={40}
                                className="text-gray-600 drop-shadow-lg"
                                strokeWidth={2.5}
                            />
                        </button>
                    )}

                    {/* Photos container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                        dir="ltr"
                    >
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="relative flex-shrink-0 w-[150px] h-[150px] rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <Image
                                    src={photo.url}
                                    alt={`Photo ${index + 1}`}
                                    fill
                                    sizes="150px"
                                    className="object-cover"
                                    loading={index < 6 ? "eager" : "lazy"}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right gradient shadow */}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    )}

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 transition-all hover:scale-110"
                            aria-label="Next photo"
                        >
                            <ChevronRight
                                size={40}
                                className="text-gray-600 drop-shadow-lg"
                                strokeWidth={2.5}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}