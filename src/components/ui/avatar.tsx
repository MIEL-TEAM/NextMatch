"use client";
import Image from "next/image";

export function Avatar({
  src,
  alt,
  size = "md",
}: {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`rounded-full overflow-hidden bg-gray-200 ${sizes[size]}`}>
      {src ? (
        <Image
          src={src}
          alt={alt || "avatar"}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
          ?
        </div>
      )}
    </div>
  );
}
