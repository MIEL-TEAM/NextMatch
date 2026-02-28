import { isActivePremium, formatPremiumUntil, PremiumUserShape } from "@/lib/premiumUtils";

interface PremiumLabelProps {
    user?: PremiumUserShape | null;
    variant: "inline" | "profile";
}

export default function PremiumLabel({ user, variant }: PremiumLabelProps) {
    if (!isActivePremium(user)) return null;

    if (variant === "inline") {
        return (
            <span
                className="inline-flex items-baseline"
                aria-label="חבר Miel+ פעיל"
            >
                {/* Separator: middle dot with consistent spacing on both sides */}
                <span
                    className="mx-1.5 text-current"
                    style={{ opacity: 0.45, fontWeight: 400 }}
                    aria-hidden="true"
                >
                    ·
                </span>
                {/* Label: slightly smaller, medium weight, 88% opacity — reads as metadata */}
                <span
                    className="text-[0.82em] tracking-wide"
                    style={{ fontWeight: 500, opacity: 0.88, letterSpacing: "0.04em" }}
                >
                    Miel+
                </span>
            </span>
        );
    }

    const until = formatPremiumUntil(user?.premiumUntil);

    return (
        <div
            className="mt-3 flex flex-col gap-0.5"
            aria-label="פרטי מנוי Premium"
        >
            <span
                className="text-[13px] tracking-wide text-white/75"
                style={{ fontWeight: 500, letterSpacing: "0.05em" }}
            >
                Miel+ Member
            </span>
            {until && (
                <span
                    className="text-[12px] text-white/50"
                    style={{ fontWeight: 400 }}
                >
                    פעיל עד {until}
                </span>
            )}
        </div>
    );
}
