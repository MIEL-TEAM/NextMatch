import { getMemberPhotosByUserId } from "@/app/actions/memberActions";
import { CardBody, CardHeader, Divider, Image } from "@nextui-org/react";

import React from "react";

export default async function PhotosPage({params}: {params: {userId: string}}) {
  const { userId } = await params; 

  const photos = await getMemberPhotosByUserId(userId)

  return (
    <>
      <CardHeader className="text-2xl font-semibold text-secondary">
        תמונות
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="grid grid-cols-5 gap-3">
           {photos && photos.map(photo => (
            <div key={photo.id}>
              <Image
               width={300}
               height={200}
               src={photo.url}
               alt="image of member"
               className="object-cover aspect-square"
              />
            </div>
           ))}
        </div>
      </CardBody>
    </>
  );
}
