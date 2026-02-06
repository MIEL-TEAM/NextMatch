import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useSearchStore from "./useSearchStore";
import useFilterStore from "./useFilterStore";
import { searchMembers } from "@/app/actions/searchActions";

interface UseSearchParams {
  userLocation?: { latitude: number; longitude: number } | null;
  onSearchComplete?: () => void; // Callback to close modal
}

export const useSearch = ({
  userLocation,
  onSearchComplete,
}: UseSearchParams = {}) => {
  const router = useRouter();

  // Get search store state and actions
  const {
    citySearch,
    cityCoordinates,
    selectedInterests,
    results,
    isSearching,
    hasSearched,
    lastSearchTimestamp,
    setCitySearch,
    toggleInterest,
    setInterests,
    setSearching,
    setResults,
    clearSearch,
    reset,
  } = useSearchStore();

  // Get filter store state (for future integration)
  const { filters } = useFilterStore();

  const executeSearch = useCallback(async () => {
    // Validate: Must have city or interests
    if (!citySearch && selectedInterests.length === 0) {
      console.warn("Search requires city or interests");
      return;
    }

    // Prevent duplicate searches
    if (isSearching) {
      return;
    }

    setSearching(true);

    try {
      // Clean city name - remove country and extra text
      // "נתניה, ישראל" -> "נתניה"
      let cleanCityName: string | undefined = undefined;

      if (citySearch && citySearch.trim()) {
        const trimmedCity = citySearch.split(",")[0].trim();
        // Use city filter if:
        // 1. User selected from dropdown (has coordinates), OR
        // 2. Typed city name is at least 2 characters
        if (cityCoordinates || trimmedCity.length >= 2) {
          cleanCityName = trimmedCity;
        }
      }

      // Execute search with validated parameters
      const searchResults = await searchMembers({
        city: cleanCityName,
        interests: selectedInterests.length ? selectedInterests : undefined,
        userLat: userLocation?.latitude.toString(),
        userLon: userLocation?.longitude.toString(),
      });

      // Update store with results
      setResults(searchResults);

      // Build URL params for navigation
      const params = new URLSearchParams();

      // Add city param
      if (cleanCityName) {
        params.set("city", cleanCityName);
      }

      // Add interests params (multiple values)
      if (selectedInterests.length > 0) {
        selectedInterests.forEach((interest) => {
          params.append("interests", interest);
        });
      }

      // Add location params if available
      if (userLocation) {
        params.set("userLat", userLocation.latitude.toString());
        params.set("userLon", userLocation.longitude.toString());
        params.set("sortByDistance", "true");
      }

      // Navigate to /members with search params
      router.push(`/members?${params.toString()}`);

      // Call completion callback (closes modal)
      if (onSearchComplete) {
        onSearchComplete();
      }

      return searchResults;
    } catch (error) {
      console.error("Search execution failed:", error);

      // Set empty results on error
      setResults([]);

      return [];
    } finally {
      setSearching(false);
    }
  }, [
    citySearch,
    cityCoordinates,
    selectedInterests,
    userLocation,
    isSearching,
    setSearching,
    setResults,
    router,
    onSearchComplete,
  ]);

  // Derived state: Can search if criteria exists
  const canSearch = !!(citySearch || selectedInterests.length > 0);

  // Derived state: Has active search if results exist and not currently searching
  const hasActiveSearch = hasSearched && results.length > 0 && !isSearching;

  // Derived state: Count of active non-default filters
  const activeFiltersCount = [
    // City is set
    citySearch ? 1 : 0,
    // Interests are selected
    selectedInterests.length > 0 ? 1 : 0,
    // Gender filter is not default (not both selected)
    filters.gender.length !== 2 ? 1 : 0,
    // Age range is not default
    filters.ageRange[0] !== 18 || filters.ageRange[1] !== 65 ? 1 : 0,
    // Photo filter is not default (default is true)
    !filters.withPhoto ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return {
    // Search criteria
    citySearch,
    cityCoordinates,
    selectedInterests,

    // Search results and state
    results,
    isSearching,
    hasSearched,
    lastSearchTimestamp,

    // Actions
    setCitySearch,
    toggleInterest,
    setInterests,
    executeSearch,
    clearSearch,
    reset,

    // Derived state
    canSearch,
    hasActiveSearch,
    activeFiltersCount,

    // Filter state (for display/integration)
    filters,
  };
};
