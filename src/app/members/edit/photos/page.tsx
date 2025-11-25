import { getAuthUserId } from "@/lib/session";
import { getSelfProfile } from "@/lib/getSelfProfile";
import { CardBody, CardHeader, Divider } from "@nextui-org/react";
import React from "react";
import MemberPhotoUpload from "./MemberPhotoUpload";
import MemberPhotos from "@/components/MemberPhotos";

export default async function PhotosPage() {
  const userId = await getAuthUserId();
  const profile = await getSelfProfile(userId);

  if (!profile) return null;

  const member = profile;
  const photos = profile.photos;

  return (
    <>
      <CardHeader className="flex flex-col md:flex-row justify-between items-center p-4">
        <div className="text-2xl font-semibold text-secondary mb-4 md:mb-0">
          עריכת תמונות פרופיל
        </div>
        <MemberPhotoUpload />
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <MemberPhotos
          photos={photos}
          editing={true}
          mainImageUrl={member?.image}
        />
      </CardBody>
    </>
  );
}
