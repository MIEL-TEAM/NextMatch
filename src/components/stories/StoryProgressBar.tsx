"use client";

interface StoryProgressBarProps {
  progress: number;
}

export function StoryProgressBar({ progress }: StoryProgressBarProps) {
  return (
    <div className="flex-1 h-0.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
