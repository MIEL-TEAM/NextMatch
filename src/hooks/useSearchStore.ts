import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { SearchResult } from "@/app/actions/searchActions";

interface SearchState {
  // Persisted search criteria
  citySearch: string;
  cityCoordinates?: { lat: number; lng: number };
  selectedInterests: string[];

  // Session-only data
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  lastSearchTimestamp: number | null;

  // Actions
  setCitySearch: (city: string, coords?: { lat: number; lng: number }) => void;
  toggleInterest: (interest: string) => void;
  setInterests: (interests: string[]) => void;
  setResults: (results: SearchResult[]) => void;
  setSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
  reset: () => void;
}

const initialState = {
  citySearch: "",
  cityCoordinates: undefined,
  selectedInterests: [],
  results: [],
  isSearching: false,
  hasSearched: false,
  lastSearchTimestamp: null,
};

const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Set city search with optional coordinates
        setCitySearch: (city: string, coords?: { lat: number; lng: number }) =>
          set(
            {
              citySearch: city,
              cityCoordinates: coords,
            },
            false,
            "search/setCitySearch"
          ),

        // Toggle interest - add if not present, remove if present
        toggleInterest: (interest: string) =>
          set(
            (state) => {
              const interests = state.selectedInterests.includes(interest)
                ? state.selectedInterests.filter((i) => i !== interest)
                : [...state.selectedInterests, interest];

              return { selectedInterests: interests };
            },
            false,
            "search/toggleInterest"
          ),

        // Replace entire interests array
        setInterests: (interests: string[]) =>
          set({ selectedInterests: interests }, false, "search/setInterests"),

        // Update search results and mark as searched
        setResults: (results: SearchResult[]) =>
          set(
            {
              results,
              hasSearched: true,
              lastSearchTimestamp: Date.now(),
            },
            false,
            "search/setResults"
          ),

        // Update searching state
        setSearching: (isSearching: boolean) =>
          set({ isSearching }, false, "search/setSearching"),

        // Clear search results but keep criteria
        clearSearch: () =>
          set(
            {
              results: [],
              hasSearched: false,
              lastSearchTimestamp: null,
              isSearching: false,
            },
            false,
            "search/clearSearch"
          ),

        // Reset everything to initial state
        reset: () => set(initialState, false, "search/reset"),
      }),
      {
        name: "search-storage", // localStorage key
        // Only persist search criteria, not results or search state
        partialize: (state) => ({
          citySearch: state.citySearch,
          cityCoordinates: state.cityCoordinates,
          selectedInterests: state.selectedInterests,
        }),
      }
    ),
    { name: "SearchStore" }
  )
);

export default useSearchStore;
