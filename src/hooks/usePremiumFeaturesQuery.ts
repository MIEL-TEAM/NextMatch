import { useQuery } from "@tanstack/react-query";

export const usePremiumFeaturesQuery = () => {
  return useQuery({
    queryKey: ["premiumFeatures"],
    queryFn: async () => {
      const res = await fetch("/api/premium");
      if (!res.ok) throw new Error("שגיאה בטעינת פרטי הפרימיום");
      return res.json() as Promise<{
        features: string[];
        isActive: boolean;
        expiresAt: string | null;
      }>;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
