import { useQuery } from "@tanstack/react-query";

export const useMessagesQuery = (container: string) => {
  return useQuery({
    queryKey: ["messages", container],
    queryFn: async () => {
      const res = await fetch(`/api/messages?container=${container}`);
      if (!res.ok) throw new Error("לא ניתן לטעון הודעות");
      return res.json() as Promise<{
        messages: any[];
        nextCursor: string | null;
      }>;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
