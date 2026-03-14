export type CelebrationType =
  | "mutual-like"
  | "smart-match"
  | "first-message"
  | "profile-boost"
  | "new-connection"
  | "achievement";

export interface CelebrationConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sound?: string;
  confettiColors: string[];
  actions?: {
    primary?: {
      text: string;
      action: () => void;
      icon?: React.ReactNode;
    };
    secondary?: {
      text: string;
      action: () => void;
    };
  };
}

export interface CelebrationData {
  userName?: string;
  userImage?: string;
  currentUserImage?: string;
  matchedUserId?: string;
  matchScore?: number;
  customTitle?: string;
  customSubtitle?: string;
}

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  data?: CelebrationData;
}
