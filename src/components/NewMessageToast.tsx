import { transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import { NewMessageToastProps } from "@/types/chat";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";
export default function NewMessageToast({ message }: NewMessageToastProps) {
  return (
    <Link 
      href={`/members/${message.senderId}`} 
      className="flex items-center gap-3 w-full active:opacity-80 transition-opacity"
    >
      <div className="flex-shrink-0">
        <Image
          src={transformImageUrl(message.senderImage) || "/images/user.png"}
          height={44}
          width={44}
          alt="Sender image"
          className="object-cover rounded-full border-2 border-white/20"
        />
      </div>

      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-semibold text-white text-sm leading-tight truncate">
          {message.senderName} שלח לך הודעה
        </div>
        <div className="text-xs text-white/80 mt-0.5">לחץ לעבור להודעה</div>
      </div>
    </Link>
  );
}

export const newMessageToast = (message: MessageDto) => {
  toast(<NewMessageToast message={message} />, {
    style: getToastStyle(),
  });
};
