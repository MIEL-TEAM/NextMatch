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
      className="flex items-center p-3 rounded-full shadow-lg 
      bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-400 
      text-white w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
      mx-auto transition-transform duration-300 hover:scale-105"
      style={{
        background: "linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)",
        padding: "7px 16px",
        borderRadius: "20px",
      }}
    >
      <div className="mr-3 flex-shrink-0">
        <Image
          src={transformImageUrl(image) || "/images/user.png"}
          width={50}
          height={50}
          className="object-cover rounded-full border-2 border-white"
          alt="Sender image"
        />
      </div>

      <div className="flex flex-col flex-grow justify-center">
        <div className="font-semibold text-sm sm:text-base">{title}</div>
        <div className="text-xs sm:text-sm opacity-90">
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
    />,
    {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        background: "none",
        boxShadow: "none",
        padding: "0",
      },
    }
  );
};

export const newLikeToast = (
  name: string,
  image: string | null,
  userId: string
) => {
  toast(
    <NotificationToast
      image={image}
      href={`/members/${userId}`}
      title={`${name} אהב/ה את הפרופיל שלך! בוא/י לראות מי זה `}
      subtitle="לחץ/י כאן כדי לצפות בפרופיל שלהם"
    />,
    {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        background: "none",
        boxShadow: "none",
        padding: "0",
      },
    }
  );
};
