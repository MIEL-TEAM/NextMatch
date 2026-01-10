"use client";

import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from "@nextui-org/react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ProfileCompletionStatus } from "@/types/userAction";

type ProfileCompletionButtonProps = {
  status: ProfileCompletionStatus;
};

export default function ProfileCompletionButton({
  status,
}: ProfileCompletionButtonProps) {
  if (!status) {
    return null;
  }

  const incompleteTasks = status.tasks.filter((task: any) => !task.completed);

  if (status.completionPercentage >= 100 && incompleteTasks.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-white shadow-inner">
        <CheckCircle2 className="h-4 w-4 text-emerald-200" />
        <span className="text-sm font-semibold">הפרופיל שלך מושלם</span>
      </div>
    );
  }

  const recommended = status.recommendedAction ?? incompleteTasks[0] ?? null;

  return (
    <Popover placement="bottom-end" showArrow>
      <PopoverTrigger>
        <Button
          radius="full"
          className="relative flex items-center gap-3 bg-gradient-to-r from-[#FF6A00] via-[#FF4E00] to-[#E63946] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span>שפר פרופיל</span>
          <span className="rounded-full bg-[#FFC857] px-2 py-1 text-xs font-bold text-[#732400] shadow-md">
            {status.completionPercentage}%
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="w-80 max-w-sm space-y-4 rounded-xl bg-white p-4 text-right shadow-xl">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">מצב הפרופיל שלך</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold text-gray-900">
                {status.completionPercentage}% הושלם
              </span>
              <span className="text-2xl font-bold text-[#E37B27]">
                {status.completionPercentage}%
              </span>
            </div>
            <Progress
              value={status.completionPercentage}
              maxValue={100}
              color="warning"
              className="h-2 rounded-full"
              aria-label="אחוז השלמת פרופיל"
            />
          </div>

          {recommended && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-amber-800">
              <div className="flex items-center justify-end gap-2 text-sm font-semibold">
                <span>השלב הבא המומלץ</span>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-sm font-semibold text-amber-900">
                {recommended.label}
              </div>
              <div className="text-sm leading-relaxed">
                {recommended.description}
              </div>
              <Button
                as={Link}
                href={recommended.actionHref}
                size="sm"
                className="h-8 w-full bg-[#E37B27] text-sm font-semibold text-white hover:bg-[#FFB547]"
              >
                לטיפול עכשיו
              </Button>
            </div>
          )}

          <Divider className="bg-gray-100" />

          <div className="space-y-3">
            {incompleteTasks.map((task: any) => {
              const taskProgress = Math.round(task.progress * 100);

              return (
                <div
                  key={task.key}
                  className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                    <span>{task.label}</span>
                    <span>{taskProgress}%</span>
                  </div>
                  <Progress
                    value={taskProgress}
                    maxValue={100}
                    color="warning"
                    className="mt-2 h-1.5 rounded-full"
                    aria-label={`התקדמות עבור ${task.label}`}
                  />
                  <p className="mt-2 text-xs text-gray-600">
                    {task.description}
                  </p>
                  <Button
                    as={Link}
                    href={task.actionHref}
                    size="sm"
                    variant="light"
                    color="warning"
                    className="mt-2 h-7 px-3 text-xs font-semibold"
                  >
                    עבור לעדכון
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
