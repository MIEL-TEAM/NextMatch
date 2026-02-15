"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";
import { DiscoveryMode } from "@/types/members";

const paramMap: Record<DiscoveryMode, string> = {
    smart: "התאמה חכמה",
    activity: "פעילים",
    newest: "חדשים",
    distance: "קרובים",
};

const options: DiscoveryMode[] = ["smart", "activity", "newest", "distance"];

export default function DiscoverySortControl() {
    const discoveryMode = useSearchPreferencesStore((s) => s.discoveryMode);
    const setDiscoveryMode = useSearchPreferencesStore((s) => s.setDiscoveryMode);

    return (
        <motion.div
            className="flex flex-col items-center gap-4 mb-6 sm:mb-8 px-2 sm:px-0 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            <div className="flex justify-center gap-2 sm:gap-3 bg-white/50 p-1.5 rounded-full shadow-sm">
                {options.map((mode) => (
                    <motion.button
                        key={mode}
                        onClick={() => setDiscoveryMode(mode)}
                        className={`relative min-w-[70px] sm:min-w-[80px] px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-sm font-medium transition-all z-10 ${discoveryMode === mode
                            ? "text-white"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        {discoveryMode === mode && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full -z-10 shadow-md"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{paramMap[mode]}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
