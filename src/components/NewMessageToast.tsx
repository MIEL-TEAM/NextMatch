import { transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";

type NewMessageToastProps = {
  message: MessageDto;
};
export default function NewMessageToast({ message }: NewMessageToastProps) {
  return (
    <Link href={`/members/${message.senderId}`} className="flex items-center">
      <div className="mr-2">
        <Image
          src={transformImageUrl(message.senderImage) || "/images/user.png"}
          height={40}
          width={40}
          alt="Sender image"
          className="object-cover rounded-full"
        />
      </div>

      <div className="flex flex-grow flex-col justify-center">
        <div className="font-semibold text-white text-sm sm:text-base">
          {message.senderName} שלח לך הודעה
        </div>
        <div className="text-xs text-white">לחץ לעבור להודעה</div>
      </div>
    </Link>
  );
}

export const newMessageToast = (message: MessageDto) => {
  toast(<NewMessageToast message={message} />, {
    style: getToastStyle(),
  });
};
