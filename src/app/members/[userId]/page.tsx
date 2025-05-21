import { getMemberByUserId } from "@/app/actions/memberActions";
import { getUserInterestsByUserId } from "@/app/actions/interestsAction";
import { getMemberVideos } from "@/app/actions/videoActions";
import { notFound } from "next/navigation";
import React from "react";
import { Divider } from "@nextui-org/react";
import ProfileHeader from "@/components/ProfileHeader";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import InterestsSection from "@/components/interests/InterestsSection";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { auth } from "@/auth";
import VideoUploadSection from "@/components/video/VideoUploadSection";
import VideoPlayer from "@/components/video/VideoPlayer";

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

  const memberVideos = await getMemberVideos(member.id);

  const formattedVideos = memberVideos.map((video) => ({
    url: video.url,
    id: video.id,
    createdAt: video.createdAt.toISOString(),
  }));

  return (
    <ProfileViewTracker userId={userId}>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-4">
            {memberVideos.length > 0 && (
              <div className="w-full flex justify-center">
                <div className="w-full max-w-2xl bg-white border border-rose-200 rounded-3xl shadow-lg p-4 flex flex-col gap-4 items-center text-center">
                  <h3 className="text-lg font-semibold text-rose-600">
                    הצצה לווידאו של {member.name}
                  </h3>

                  <div className="w-full rounded-xl overflow-hidden aspect-video border border-rose-300 shadow-inner">
                    <VideoPlayer
                      url={memberVideos[0].url}
                      aspectRatio="video"
                      autoPlay={false}
                      loop={true}
                      muted={false}
                    />
                  </div>

                  <p className="text-sm text-gray-600 leading-snug max-w-sm">
                    הכירו את {member.name} דרך סרטון אישי. זו דרך נעימה להתחיל
                    להתרשם – עוד לפני שניגשים לקרוא. ✨
                  </p>
                </div>
              </div>
            )}

            <CardInnerWrapper
              header="פרופיל"
              body={
                <div className="p-4 text-justify">{member.description}</div>
              }
            />
            <ProfileHeader member={member} userId={userId} likeIds={likeIds} />
            <Divider />
            <InterestsSection
              interests={interests}
              isOwnProfile={isOwnProfile}
            />
            {isOwnProfile && (
              <>
                <Divider />
                <VideoUploadSection
                  memberId={member.id}
                  existingVideos={formattedVideos}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </ProfileViewTracker>
  );
}
