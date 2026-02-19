"use client";

import React from "react";

export default function MembersSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4 animate-pulse">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 h-[220px] sm:h-[260px] rounded-xl"
                    />
                ))}
            </div>
        </div>
    );
}
