"use client";

import React, { useState, useEffect } from "react";
import { Image as NextUIImage } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  isZoomed?: boolean;
  removeWrapper?: boolean;
  style?: React.CSSProperties;
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fallbackSrc = "/images/user.png",
  isZoomed = false,
  removeWrapper = false,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const optimizedSrc = src
        ? transformImageUrl(src, width, height)
        : fallbackSrc;
      setImgSrc(optimizedSrc);
      setLoading(false);
    }
  }, [src, width, height, fallbackSrc]);

  if (loading) {
    return (
      <div
        className={`${className} bg-gray-200 animate-pulse`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
          aspectRatio: !height && width ? "1/1" : undefined,
        }}
      />
    );
  }

  return (
    <NextUIImage
      src={imgSrc}
      alt={alt}
      isZoomed={isZoomed}
      removeWrapper={removeWrapper}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
