import React from "react";
import { motion } from "framer-motion";
import MemberCard from "@/app/members/MemberCard";
import MembersSkeleton from "@/components/memberStyles/MembersSkeleton";
import PaginationComponent from "@/components/PaginationComponent";
import { Member } from "@prisma/client";
import { useIsFetching } from "@tanstack/react-query";

interface MemberWithMedia {
  member: Member;
  photos: Array<{ url: string; id: string }>;
  videos: Array<{ url: string; id: string }>;
}

interface Props {
  membersData: MemberWithMedia[];
  likeIds: string[];
  totalCount: number;
  onLike: (memberId: string, isLiked: boolean) => void;
}

const MembersGrid: React.FC<Props> = ({
  membersData,
  likeIds,
  totalCount,
  onLike,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const isFetching = useIsFetching({ queryKey: ["members"] }) > 0;

  if (isFetching) {
    return <MembersSkeleton />;
  }

  return (
    <motion.div
      className="w-screen px-4 sm:px-7"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4">
        {membersData.map(({ member, photos, videos }) => (
          <motion.div
            key={member.id}
            variants={item}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="absolute inset-1 bg-gradient-to-r from-amber-300/20 to-orange-400/20 rounded-lg blur-[0.5px] opacity-0 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative">
              <MemberCard
                member={member}
                likeIds={likeIds}
                memberPhotos={photos}
                memberVideos={videos}
                onLike={onLike}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 sm:mt-12 flex justify-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <PaginationComponent totalCount={totalCount} />
      </motion.div>
    </motion.div>
  );
};

export default MembersGrid;
