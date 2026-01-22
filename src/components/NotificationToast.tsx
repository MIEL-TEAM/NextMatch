import React from "react";
import Link from "next/link";
import { Image } from "@nextui-org/react";
import { transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import { toast } from "react-toastify";

type NotificationToastProps = {
  image?: string | null;
  href: string;
  title: string;
  subtitle?: string;
};

export default function NotificationToast({
  image,
  href,
  title,
  subtitle,
}: NotificationToastProps) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 w-full active:opacity-80 transition-opacity"
    >
      <div className="flex-shrink-0">
        <Image
          src={transformImageUrl(image) || "/images/user.png"}
          height={44}
          width={44}
          alt="Notification image"
          className="object-cover rounded-full border-2 border-white/20 w-[44px] h-[44px]"
        />
      </div>

      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-white text-sm leading-tight line-clamp-2">
          {title}
        </div>
        <div className="text-xs text-white/80 mt-0.5 truncate">
          {subtitle || "לחץ/י לצפייה בפרופיל"}
        </div>
      </div>
    </Link>
  );
}

export const newMessageToast = (message: MessageDto) => {
  toast(
    <NotificationToast
      image={message.senderImage}
      href={`/members/${message.senderId}/chat`}
      title={`${message.senderName} שלח/ה לך הודעה`}
    />
  );
};

export const newLikeToast = (
  name: string,
  image: string | null,
  userId: string
) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  toast(
    <NotificationToast
      image={image}
      href={`/members/${userId}`}
      title={`${name} אהב/ה את הפרופיל שלך!`}
      subtitle="לחץ/י כאן כדי לצפות בפרופיל"
    />,
    {
      style: {
        width: isMobile ? "calc(100% - 32px)" : "auto",
        maxWidth: isMobile ? "400px" : "350px",
        padding: isMobile ? "12px 16px" : "10px 14px",
        borderRadius: isMobile ? "16px" : "12px",
        margin: isMobile ? "0 auto" : "0",
      },
    }
  );
};
