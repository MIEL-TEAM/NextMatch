"use client";

import React from "react";
import MembersSkeleton from "./MembersSkeleton";
import SpotlightSkeleton from "./SpotlightSkeleton";
import AnimatedBackground from "./AnimatedBackground";

export default function MembersPageSkeleton() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />

            {/* Header Section */}
            <div className="relative pt-8 sm:pt-12 pb-4 sm:pb-6 px-3 sm:px-4 md:px-8 text-center animate-pulse">

                {/* H1 Title */}
                <div className="h-10 md:h-14 bg-gray-200 rounded w-3/4 md:w-1/2 mx-auto mb-3"></div>

                {/* Subtitle */}
                <div className="h-6 bg-gray-200 rounded w-2/3 md:w-1/3 mx-auto mb-8"></div>

                {/* Spotlight Skeleton */}
                <SpotlightSkeleton />

                {/* Sort Controls Stub */}
                <div className="h-10 w-full max-w-md mx-auto bg-gray-200 rounded-full mb-8"></div>
            </div>

            {/* Members Grid Skeleton */}
            <MembersSkeleton />
        </div>
    );
}
