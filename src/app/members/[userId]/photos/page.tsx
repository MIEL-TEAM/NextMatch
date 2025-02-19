import { getMemberPhotosByUserId } from "@/app/actions/memberActions";
import MemberPhotos from "@/components/MemberPhotos";
import { CardBody, CardHeader, Divider } from "@nextui-org/react";

import React from "react";

type PhotosPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function PhotosPage({ params }: PhotosPageProps) {
  const { userId } = await params;

  const photos = await getMemberPhotosByUserId(userId);

  return (
    <>
      <CardHeader className="text-2xl font-semibold text-secondary">
        תמונות
      </CardHeader>
      <Divider />
      <CardBody>
        <MemberPhotos photos={photos} />
      </CardBody>
    </>
  );
}
