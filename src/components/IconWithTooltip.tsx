"use client";

import { useEffect, useRef, useState } from "react";

interface IconWithTooltipProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    label?: string;
}

export default function IconWithTooltip({
    icon,
    title,
    description,
    label,
}: IconWithTooltipProps) {
    const [visible, setVisible] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!visible) return;
        const dismiss = (e: MouseEvent | TouchEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setVisible(false);
            }
        };
        document.addEventListener("mousedown", dismiss);
        document.addEventListener("touchstart", dismiss);
        return () => {
            document.removeEventListener("mousedown", dismiss);
            document.removeEventListener("touchstart", dismiss);
        };
    }, [visible]);

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex items-center flex-shrink-0"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onClick={() => setVisible((v) => !v)}
            aria-label={label ?? title}
        >
            {/* Tooltip — always in DOM, opacity-only so layout never shifts */}
            <span
                role="tooltip"
                className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-xs
          whitespace-nowrap text-center shadow-sm
          transition-opacity duration-150 z-50
          ${visible ? "opacity-100" : "opacity-0"}`}
            >
                <span className="block font-semibold">{title}</span>
                {description && (
                    <span className="block font-normal opacity-75 mt-0.5">{description}</span>
                )}
            </span>

            {icon}
        </span>
    );
}
