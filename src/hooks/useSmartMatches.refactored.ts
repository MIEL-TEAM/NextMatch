import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSmartMatches } from "@/app/actions/smartMatchActions";
import {
  useSearchPreferencesStore,
  selectIsHydrated,
} from "@/stores/searchPreferencesStore";

export function useSmartMatches(page: number, pageSize = 12) {
  const queryClient = useQueryClient();
  const isHydrated = useSearchPreferencesStore(selectIsHydrated);

  const query = useQuery({
    queryKey: ["smartMatches", page, pageSize],
    queryFn: () => getSmartMatches(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: isHydrated,
  });

  const prefetchNextPage = () => {
    if (query.data && query.data.items.length === pageSize) {
      queryClient.prefetchQuery({
        queryKey: ["smartMatches", page + 1, pageSize],
        queryFn: () => getSmartMatches(),
      });
    }
  };

  return {
    ...query,
    prefetchNextPage,
  };
}
