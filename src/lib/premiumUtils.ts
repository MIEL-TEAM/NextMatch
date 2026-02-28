export interface PremiumUserShape {
    isPremium?: boolean | null;
    premiumUntil?: Date | string | null;
}

export function isActivePremium(user?: PremiumUserShape | null): boolean {
    if (!user?.isPremium) return false;
    if (!user.premiumUntil) return false;
    const until =
        user.premiumUntil instanceof Date
            ? user.premiumUntil
            : new Date(user.premiumUntil);
    return until > new Date();
}

export function formatPremiumUntil(
    premiumUntil: Date | string | null | undefined
): string {
    if (!premiumUntil) return "";
    const date =
        premiumUntil instanceof Date ? premiumUntil : new Date(premiumUntil);
    return new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}
