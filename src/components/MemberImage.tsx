"use client";

import { Photo } from "@prisma/client";
import { CldImage } from "next-cloudinary";
import { Button, Image, useDisclosure } from "@nextui-org/react";
import React from "react";
import clsx from "clsx";
import { useRole } from "@/hooks/useRole";
import { ImCheckmark, ImCross } from "react-icons/im";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { approvePhoto, rejectPhoto } from "@/app/actions/adminActions";
import AppModal from "./AppModal";

type MemberImageProps = {
  photo: Photo | null;
};

export default function MemberImage({ photo }: MemberImageProps) {
  const role = useRole();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!photo) return null;

  const approve = async (photoId: string) => {
    try {
      await approvePhoto(photoId);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const reject = async (photo: Photo) => {
    try {
      await rejectPhoto(photo);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="cursor-pointer" onClick={onOpen}>
      {photo?.publicId ? (
        <CldImage
          alt="Image of member"
          src={photo.publicId}
          width={300}
          height={300}
          crop="fill"
          gravity="faces"
          className={clsx("rounded-2xl", {
            "opacity-40": !photo?.isApproved && role !== "ADMIN",
          })}
          priority
        />
      ) : (
        <Image
          width={300}
          height={""}
          src={photo?.url || "/images/user.png"}
          alt="Image of user"
          className="object-cover"
        />
      )}
      {!photo?.isApproved && role !== "ADMIN" && (
        <div className="absolute bottom-2 w-full bg-slate-200 p-1">
          <div className="flex justify-center text-danger font-semibold">
            בהמתנה לאישור
          </div>
        </div>
      )}

      {role === "ADMIN" && (
        <div className="flex flex-row gap-2 mt-2">
          <Button
            onPress={() => approve(photo.id)}
            color="success"
            variant="bordered"
            fullWidth
          >
            <ImCheckmark size={20} />
          </Button>

          <Button
            onPress={() => reject(photo)}
            color="danger"
            variant="bordered"
            fullWidth
          >
            <ImCross size={20} />
          </Button>
        </div>
      )}

      <AppModal
        imageModal={true}
        isOpen={isOpen}
        onClose={onClose}
        body={
          <>
            {photo?.publicId ? (
              <CldImage
                alt="Image of member"
                src={photo.publicId}
                width={750}
                height={750}
                sizes="(max-width: 480px) 95vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 750px"
                className={clsx(
                  "w-full object-cover rounded-2xl transition-opacity duration-300",
                  {
                    "opacity-40": !photo?.isApproved && role !== "ADMIN",
                  }
                )}
                crop="fill"
                gravity="faces"
                priority
              />
            ) : (
              <Image
                width={750}
                height={""}
                src={photo?.url || "/images/user.png"}
                alt="Image of user"
                className="object-cover"
              />
            )}
          </>
        }
      />
    </div>
  );
}
