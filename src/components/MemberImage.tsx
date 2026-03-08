"use client";

import { Photo } from "@prisma/client";
import { CldImage } from "next-cloudinary";
import { Button, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import clsx from "clsx";
import { useRole } from "@/hooks/useRole";
import Icon from "@/lib/table/Icon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approvePhoto, rejectPhoto } from "@/app/actions/adminActions";
import AppModal from "./AppModal";

type MemberImageProps = {
  photo: Photo | null;
  isPriority?: boolean;
  onError?: (id: string) => void;
};

export default function MemberImage({
  photo,
  isPriority = false,
  onError,
}: MemberImageProps) {
  const role = useRole();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasError, setHasError] = React.useState(false);

  if (!photo) return null;

  if (hasError) {
    return (
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-200">
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Image
            width={300}
            height={300}
            src="/images/user.png"
            alt="Content blocked"
            className="object-cover w-full h-full grayscale"
          />
        </div>
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-600/90 to-transparent p-4 rounded-b-2xl">
          <div className="flex flex-col items-center text-white">
            <Icon name="ban" className="size-8 bg-white mb-1" />
            <span className="font-semibold text-center">התוכן אינו מורשה</span>
          </div>
        </div>
      </div>
    );
  }

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
          loading={isPriority ? "eager" : "lazy"}
          onError={() => {
            setHasError(true);
            onError?.(photo.id);
          }}
        />
      ) : (
        <Image
          width={300}
          height={300}
          src={photo?.url || "/images/user.png"}
          alt="Image of user"
          className="object-cover rounded-2xl"
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "auto"}
          onError={() => {
            setHasError(true);
            onError?.(photo.id);
          }}
        />
      )}
      {!photo?.isApproved && role !== "ADMIN" && (
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-600/80 to-transparent p-4 rounded-b-2xl">
          <div className="flex flex-col items-center text-white">
            <Icon name="triangle-exclamation" type="sol" className="size-8 bg-white mb-1" />
            <span className="font-semibold text-center">
              תמונה זו ממתינה לאישור מנהל
            </span>
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
            <Icon name="check" className="size-5 bg-green-600" />
          </Button>

          <Button
            onPress={() => reject(photo)}
            color="danger"
            variant="bordered"
            fullWidth
          >
            <Icon name="xmark" className="size-5 bg-red-600" />
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
                loading="lazy"
              />
            ) : (
              <Image
                width={750}
                height={750}
                src={photo?.url || "/images/user.png"}
                alt="Image of user"
                className="object-cover rounded-2xl"
                loading="lazy"
                fetchPriority="auto"
              />
            )}
          </>
        }
      />
    </div>
  );
}
