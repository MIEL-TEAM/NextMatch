import { Member, Photo } from "@prisma/client";

export type DiscoveryMode = "smart" | "activity" | "newest" | "distance";

export type MemberCardData = {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  description: string;
  image: string | null;
  updated: Date;
  created: Date;
  latitude: number | null;
  longitude: number | null;
  gender?: string | null;
  user: {
    oauthVerified: boolean;
    lastActiveAt: Date | null;
  };
};

export type LocationState =
  | "initial"
  | "checkingUrlLocation"
  | "checkingDbLocation"
  | "requestingBrowserPermission"
  | "gettingBrowserLocation"
  | "usingBrowserLocation"
  | "usingDbLocation"
  | "noLocationAvailable"
  | "readyToQuery";

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface DbLocationStatus {
  hasLocation: boolean;
  locationEnabled: boolean;
  coordinates: LocationData | null;
}

export interface StableLocationParams {
  userLat: string | null;
  userLon: string | null;
  hasLocation: boolean;
  forceLocationPrompt: boolean;
}

export interface MemberWithMedia {
  member: Member;
  photos: Array<{ url: string; id: string }>;
  videos: Array<{ url: string; id: string }>;
}

export interface Props {
  membersData: MemberWithMedia[];
  totalCount: number;
  likeIds: string[];
  mode: DiscoveryMode;
  noResults: boolean;
  hasSeenIntro: boolean;
  currentUserId?: string;
  onLikeUpdate?: (memberId: string, isLiked: boolean) => void;
}

export interface MemberCardProps {
  member: Member & {
    distance?: number;
    user?: {
      oauthVerified?: boolean;
      lastActiveAt?: Date | null;
      isPremium?: boolean;
      premiumUntil?: Date | null;
    };
  };
  likeIds: string[];
  memberPhotos?: Array<{ url: string; id: string }>;
  memberVideos?: Array<{ url: string; id: string }>;
  onLike?: (memberId: string, isLiked: boolean) => void;
  isPriority?: boolean;
}

export type MemberPhotosProps = {
  photos: Photo[] | null;
  editing?: boolean;
  mainImageUrl?: string | null;
};

export interface CarouselProps<T> {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
  onIndexChange?: (index: number) => void;
  enableSwipe?: boolean;
  showArrows?: boolean;
}
