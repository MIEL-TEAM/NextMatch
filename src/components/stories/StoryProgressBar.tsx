"use client";

interface StoryProgressBarProps {
  progress: number;
}

export function StoryProgressBar({ progress }: StoryProgressBarProps) {
  return (
    <div className="flex-1 h-0.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
      <div
        className={`h-full bg-white rounded-full ${progress === 0 ? "transition-none" : "transition-all duration-100 ease-linear"}`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
