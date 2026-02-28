"use client";

import { useEffect, useRef, useState } from "react";

interface IconWithTooltipProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    label?: string;
    placement?: "above" | "below";
    align?: "center" | "left" | "right";
}

export default function IconWithTooltip({
    icon,
    title,
    description,
    label,
    placement = "above",
    align = "center",
}: IconWithTooltipProps) {
    const [visible, setVisible] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    const positionClass =
        placement === "below"
            ? "top-full mt-2"
            : "bottom-full mb-2";

    const alignClass =
        align === "left"
            ? "left-0"
            : align === "right"
                ? "right-0"
                : "left-1/2 -translate-x-1/2";

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
                className={`pointer-events-none absolute ${positionClass} ${alignClass}
          px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-xs
          whitespace-nowrap text-center shadow-md
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
