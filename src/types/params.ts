import { ReactNode } from "react";

// Page Params
export type UserParamsProps = {
  params: Promise<{ userId: string }>;
};

export type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export type MessagesPageProps = {
  searchParams: Promise<{ container: string }>;
};

export type EditInterestsPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export type PhotosPageProps = {
  params: Promise<{ userId: string }>;
};

// Layout Props
export type UserLayoutProps = {
  children: ReactNode;
  params: Promise<{ userId: string }>;
};

export type MobileLayoutProps = {
  children: ReactNode;
};

export type MielLayoutProps = {
  children: ReactNode;
};

export type HomePageWrapperProps = {
  children: React.ReactNode;
};
