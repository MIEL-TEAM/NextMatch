import {
  getMemberByUserId,
  getMemberPhotosByUserId,
} from "@/app/actions/memberActions";
import { getUserInterestsByUserId } from "@/app/actions/interestsAction";
import { notFound } from "next/navigation";
import React from "react";
import { Divider } from "@nextui-org/react";
import ProfileHeader from "@/components/ProfileHeader";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import InterestsSection from "@/components/interests/InterestsSection";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { VideoSection } from "@/components/video/VideoSection";
import VideoSectionForProfile from "./components/VideoSection";
import { auth } from "@/auth";
import { getMemberVideos } from "@/app/actions/videoActions";

interface MemberDetailedPageProps {
  params: Promise<{ userId: string }>;
}

export default async function MemberDetailedPage({
  params,
}: MemberDetailedPageProps) {
  const { userId } = await params;
  const member = await getMemberByUserId(userId);
  const session = await auth();
  const isOwnProfile = session?.user?.id === userId;

  if (!member) return notFound();

  const likeIds = await fetchCurrentUserLikeIds();
  const interests = await getUserInterestsByUserId(userId);
  const videos = await getMemberVideos(member.id);
  const memberPhotos = await getMemberPhotosByUserId(userId);

  const formattedVideos = videos.map((video) => ({
    ...video,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
    duration: video.duration ?? 0,
  }));

  const formattedPhotos = memberPhotos
    ? memberPhotos.map((photo) => ({
        url: photo.url,
        id: photo.id,
      }))
    : [];

  const hasSingleVideo = formattedVideos.length === 1;

  const thumbnailUrl =
    formattedPhotos.length > 0 ? formattedPhotos[0].url : member.image;

  return (
    <ProfileViewTracker userId={userId}>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-4">
            <CardInnerWrapper
              header="פרופיל"
              body={
                <div className="p-4 text-justify">{member.description}</div>
              }
            />
            <ProfileHeader member={member} userId={userId} likeIds={likeIds} />
            <Divider />
            <InterestsSection interests={interests} />
            <Divider />

            {hasSingleVideo && formattedVideos[0] && (
              <CardInnerWrapper
                header={
                  <div className="flex items-center gap-2">
                    <span>סרטון פרופיל</span>
                  </div>
                }
                body={
                  <VideoSectionForProfile
                    videoUrl={formattedVideos[0].url}
                    thumbnailUrl={thumbnailUrl}
                  />
                }
              />
            )}

            {(!hasSingleVideo || isOwnProfile) && (
              <VideoSection
                videos={formattedVideos}
                memberId={member.id}
                userId={userId}
                isOwnProfile={isOwnProfile}
                member={{
                  name: member.name,
                  userId: member.userId,
                  profileImageUrl: member.image || undefined,
                }}
                memberPhotos={formattedPhotos}
              />
            )}
          </div>
        </div>
      </div>
    </ProfileViewTracker>
  );
}
