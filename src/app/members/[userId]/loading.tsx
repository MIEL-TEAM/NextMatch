import React from "react";
import HeartLoading from "@/components/HeartLoading";

export default function Loading() {
  return (
    <div className="flex justify-center items-center vertical-center">
      <HeartLoading message="טוען פרופיל..." />
    </div>
  );
}
