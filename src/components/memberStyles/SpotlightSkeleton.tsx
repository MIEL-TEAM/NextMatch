"use client";

import React from "react";

export default function SpotlightSkeleton() {
    return (
        <div className="max-w-4xl mx-auto mb-10 sm:mb-16 relative animate-pulse">
            {/* Container matching SpotlightMember dimensions */}
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden h-auto">
                <div className="flex flex-col md:flex-row">

                    {/* Image Section */}
                    <div
                        className="relative w-full md:w-1/3 bg-gray-200"
                        style={{ minHeight: "240px" }}
                    ></div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-4 md:p-8 w-full md:w-2/3 flex flex-col justify-center space-y-4">

                        {/* Title & Dots */}
                        <div className="flex items-center justify-between">
                            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="flex gap-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-200"></div>
                                ))}
                            </div>
                        </div>

                        {/* Name & Age */}
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2"></div>

                        {/* City */}
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/4"></div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 sm:gap-3 mt-4">
                            <div className="h-8 sm:h-10 bg-gray-200 rounded-full w-32"></div>
                            <div className="h-8 sm:h-10 bg-gray-200 rounded-full w-32"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
