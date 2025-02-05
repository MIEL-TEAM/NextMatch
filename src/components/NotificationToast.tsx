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
    <Link href={href} className="flex items-center">
      <div className="mr-2">
        <Image
          src={transformImageUrl(image) || "/images/user.png"}
          width={50}
          height={50}
          alt="Sender image"
        />
      </div>

      <div className="flex flex-grow flex-col justify-center">
        <div className="font-semibold">{title}</div>
        <div className="text-sm">{subtitle || "לחץ/י לצפייה בפרופיל"}</div>
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
  toast(
    <NotificationToast
      image={image}
      href={`/members/${userId}`}
      title={`${name} אהב/ה את הפרופיל שלך! בוא/י לראות מי זה `}
      subtitle="לחץ/י כאן כדי לצפות בפרופיל שלהם"
    />
  );
};
