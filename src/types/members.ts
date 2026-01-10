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
