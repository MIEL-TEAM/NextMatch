import { StoryWithUser } from "./story";

export interface StoryUser {
  id: string;
  name: string;
  image: string | null;
  hasUnviewedStories: boolean;
  totalStories: number;
  isCurrentUser?: boolean;
}

export interface StoryViewer {
  id: string;
  name: string;
  image: string | null;
  viewedAt: Date;
}

export interface StoryAnalyticsData {
  storyId: string;
  totalViews: number;
  viewers: StoryViewer[];
}

// Container Components
export interface StoriesContainerProps {
  currentUserId: string;
}

export interface StoriesCarouselProps {
  onStoryClick: (userId: string, allUsers?: StoryUser[]) => void;
  onCreateStory: () => void;
  refreshKey?: number;
  currentUserId?: string;
}

// Story Ring Component
export interface StoryRingProps {
  user: StoryUser;
  onClick: () => void;
}

// Story Viewer Component
export interface StoryViewerProps {
  isOpen: boolean;
  stories?: StoryWithUser[];
  currentStoryIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentUserId?: string;
  onStoryDeleted?: (storyId: string) => void;
}

// Story Creation Components
export interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export interface CreateStoryButtonProps {
  onClick: () => void;
}

// Story Interaction Components
export interface StoryReactionsProps {
  onReaction: (reaction: string) => void;
  onReply: () => void;
}

export interface StoryAnalyticsProps {
  storyId: string;
  isCurrentUserStory: boolean;
}

// Progress Bar Component
export interface StoryProgressBarProps {
  progress: number;
}
