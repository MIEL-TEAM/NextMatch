"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { Photo } from "@prisma/client";
import { transformImageUrl } from "@/lib/util";
import { Image } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const allImages = photos?.length
    ? photos.map((photo) => transformImageUrl(photo.url) ?? "/images/user.png")
    : [defaultImageUrl || "/images/user.png"];

  if (!allImages.length) return null;

  return (
    <div className="relative w-full h-full">
      <Swiper
        modules={[Navigation, Pagination]}
        loop
        pagination={{
          clickable: true,
          bulletActiveClass:
            "swiper-pagination-bullet-active bg-white opacity-100",
          bulletClass: "swiper-pagination-bullet bg-white/50 opacity-70",
        }}
        navigation={{
          nextEl: ".carousel-next-btn",
          prevEl: ".carousel-prev-btn",
        }}
        className="w-full h-full"
      >
        {allImages.map((src, index) => (
          <SwiperSlide key={index}>
            <Image
              isZoomed
              alt="Member photo"
              src={src}
              className="w-full h-full object-cover"
              removeWrapper
              onClick={(e) => preventNavigate?.(e)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {allImages.length > 1 && (
        <>
          <button
            onClick={(e) => preventNavigate?.(e)}
            className="carousel-prev-btn absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 z-30 flex items-center justify-center w-10 h-10 transition-all duration-200 shadow-lg border border-white/20"
            aria-label="Previous photo"
          >
            <ChevronLeft color="white" strokeWidth={3} size={20} />
          </button>

          <button
            onClick={(e) => preventNavigate?.(e)}
            className="carousel-next-btn absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 z-30 flex items-center justify-center w-10 h-10 transition-all duration-200 shadow-lg border border-white/20"
            aria-label="Next photo"
          >
            <ChevronRight color="white" strokeWidth={3} size={20} />
          </button>
        </>
      )}

      <style jsx global>{`
        .swiper-button-next::after,
        .swiper-button-prev::after {
          display: none !important;
        }

        .swiper-button-next,
        .swiper-button-prev {
          background: none !important;
          color: transparent !important;
        }
      `}</style>
    </div>
  );
}
