import { Member, Photo } from "@prisma/client";

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
  user: {
    oauthVerified: boolean;
    lastActiveAt: Date | null;
  };
};

// Location state machine states
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

// Location data structure
export interface LocationData {
  latitude: number;
  longitude: number;
}

// Database location status
export interface DbLocationStatus {
  hasLocation: boolean;
  locationEnabled: boolean;
  coordinates: LocationData | null;
}

// Stable URL params for location
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
  isOnlineFilter: boolean;
  noResults: boolean;
  hasSeenIntro: boolean;
  onLikeUpdate?: (memberId: string, isLiked: boolean) => void;
}

export interface MemberCardProps {
  member: Member & {
    distance?: number;
    user?: {
      oauthVerified?: boolean;
      lastActiveAt?: Date | null;
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