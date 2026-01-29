import { ReactNode } from "react";
import { ActionResult } from "./index";

// Modal Components
export type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  body: ReactNode;
  title?: string;
  subtitle?: string;
  disableBodyClick?: boolean;
};

// Card Components
export type CardInnerWrapperProps = {
  header: ReactNode | string;
  body: ReactNode;
  footer?: ReactNode;
};

export type CardWrapperProps = {
  children?: ReactNode;
  body?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  headerText?: string;
};

// Button Components
export type LikeButtonProps = {
  loading: boolean;
  hasLiked: boolean;
  toggleLike: () => void;
};

export type DeleteButtonProps = {
  loading: boolean;
};

export type StarButtonProps = {
  selected: boolean;
  loading: boolean;
};

// Toast Components
export type NotificationToastProps = {
  image?: string | null;
  href: string;
  title: string;
  subtitle?: string;
};

// Result Components
export type ResultMessageProps = {
  result: ActionResult<string> | null;
};

// Container Components
export type PageContainerProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

// Provider Components
export type ProvidersProps = {
  children: ReactNode;
  userId: string | null;
  unreadCount?: number;
};

export type DeviceRoutingProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
};

export type DeviceRedirectProps = {
  enabled?: boolean;
  mobileThreshold?: number;
};
