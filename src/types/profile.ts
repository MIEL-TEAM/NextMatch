import { Member, Interest, Photo } from "@prisma/client";

// Member with User relation
export type MemberWithUser = Member & {
  user?: {
    lastActiveAt?: Date | null;
    emailVerified?: Date | null;
  } | null;
};

// Profile View Props
export type DesktopProfileViewProps = {
  member: MemberWithUser;
  userId: string;
};

export type MobileProfileViewProps = {
  member: MemberWithUser;
  userId: string;
};

export type MobileProfileWrapperProps = {
  member: any;
  userId: string;
};

// Profile Components
export type ProfileHeaderProps = {
  member: MemberWithUser;
  userId: string;
};

export type PresenceProps = {
  member: MemberWithUser;
};

export type PresenceAvatarProps = {
  userId?: string;
  src?: string | null;
  size?: number;
};

// Member Components
export type MemberImageProps = {
  photo: Photo | null;
  isPriority?: boolean;
};

// Interests
export type InterestsSectionProps = {
  interests?: Interest[];
  isOwnProfile?: boolean;
  userId?: string;
};

export type EditInterestsClientProps = {
  userId: string;
  initialSelectedInterests: string[];
};

// Edit Profile
export type EditFormProps = {
  member: Member;
};

// Cover Image
export type CoverImageUploadProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCoverImage?: string | null;
};

// Image Upload
export type ImageButtonProps = {
  onUploadImage: (result: any) => void;
};
