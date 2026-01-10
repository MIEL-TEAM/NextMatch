export type ProfileCompletionKey =
  | "profileBasics"
  | "bio"
  | "mainPhoto"
  | "gallery"
  | "interests"
  | "video"
  | "location";

export type ProfileCompletionTask = {
  key: ProfileCompletionKey;
  label: string;
  description: string;
  actionHref: string;
  weight: number;
  progress: number;
  completed: boolean;
  meta?: Record<string, string | number | boolean | string[]>;
};

export type ProfileCompletionStatus = {
  completionPercentage: number;
  tasks: ProfileCompletionTask[];
  recommendedAction: ProfileCompletionTask | null;
};
