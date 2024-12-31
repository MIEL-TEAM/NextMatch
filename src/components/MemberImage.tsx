"use client";

import { Photo } from "@prisma/client";
import { CldImage } from "next-cloudinary";
import { Image } from "@nextui-org/react";
import React from "react";

type MemberImageProps = {
  photo: Photo | null;
};

export default function MemberImage({ photo }: MemberImageProps) {
  return (
    <div>
      {photo?.publicId ? (
        <CldImage
          alt="Image of member"
          src={photo.publicId}
          width={300}
          height={300}
          crop="fill"
          gravity="faces"
          className="rounded-2xl"
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
    </div>
  );
}
