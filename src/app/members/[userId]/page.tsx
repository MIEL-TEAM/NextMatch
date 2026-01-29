import { getMemberByUserId } from "@/app/actions/memberActions";
import { getUserInterestsByUserId } from "@/app/actions/interestsAction";
import { getMemberVideos } from "@/app/actions/videoActions";
import { notFound } from "next/navigation";
import React from "react";
import { Divider } from "@nextui-org/react";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import InterestsSection from "@/components/interests/InterestsSection";
import ProfileViewTracker from "@/components/profile-view/ProfileViewTracker";
import { getSession } from "@/lib/session";
import VideoUploadSection from "@/components/video/VideoUploadSection";
import VideoPlayer from "@/components/video/VideoPlayer";
import { getSelfProfile } from "@/lib/getSelfProfile";
import MobileProfileWrapper from "@/components/MobileProfileWrapper";
import DesktopProfileView from "@/components/DesktopProfileView";

interface MemberDetailedPageProps {
  params: Promise<{ userId: string }>;
}

export default async function MemberDetailedPage({
  params,
}: MemberDetailedPageProps) {
  const { userId } = await params;
  const session = await getSession();
  const isOwnProfile = session?.user?.id === userId;

 
  let member, interests, memberVideos;

  if (isOwnProfile) {
    const profile = await getSelfProfile(userId);
    if (!profile) return notFound();

    member = profile;
    interests = profile.interests.map((interest) => ({
      id: interest.id,
      name: interest.name,
      icon: interest.icon,
      category: interest.category,
    }));
    memberVideos = profile.videos;
  } else {
    member = await getMemberByUserId(userId);
    if (!member) return notFound();

    interests = await getUserInterestsByUserId(userId);
    memberVideos = await getMemberVideos(member.id);
  }

  const likeIds = await fetchCurrentUserLikeIds();

  const formattedVideos = memberVideos.map((video) => ({
    url: video.url,
    id: video.id,
    createdAt: video.createdAt.toISOString(),
  }));

  // רכיב התוכן של הדף
  const pageContent = (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile Profile View - Only on mobile */}
      <MobileProfileWrapper
        member={member}
        userId={userId}
        isOwnProfile={isOwnProfile}
        initialLiked={likeIds.includes(member.userId)}
      />

      {/* Scrollable content - includes desktop profile and other content */}
      <div className="flex-1 overflow-y-auto">
        {/* Desktop Profile View - Only on desktop */}
        <div className="hidden md:block">
          <DesktopProfileView
            member={member}
            userId={userId}
            isOwnProfile={isOwnProfile}
            initialLiked={likeIds.includes(member.userId)}
          />
        </div>

        {/* Content section */}
        <div className="flex flex-col gap-6 p-4">
          {memberVideos.length > 0 && (
            <div className="w-full flex justify-center">
              <div className="w-full max-w-2xl bg-white border border-[#FFB547]/30 rounded-3xl shadow-lg p-4 flex flex-col gap-4 items-center text-center">
                <h3 className="text-lg font-semibold text-[#E37B27]">
                  הצצה לווידאו של {member.name}
                </h3>

                <div className="w-full rounded-xl overflow-hidden aspect-video border border-[#FFB547]/50 shadow-inner">
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
          
          <Divider />
          <InterestsSection interests={interests} isOwnProfile={isOwnProfile} />
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
  );

  return isOwnProfile ? (
    pageContent
  ) : (
    <ProfileViewTracker userId={userId}>{pageContent}</ProfileViewTracker>
  );
}
