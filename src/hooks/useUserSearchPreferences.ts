"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useTransition } from "react";
import {
  dbGetUserSearchPreferences,
  updateUserSearchPreferences,
  resetUserSearchPreferences,
  UserSearchPreferenceData,
} from "@/app/actions/userSearchPreferenceActions";
import { toast } from "react-toastify";

interface UseUserSearchPreferencesOptions {
  userId: string;
  enabled?: boolean;
}

export function useUserSearchPreferences({
  userId,
  enabled = true,
}: UseUserSearchPreferencesOptions) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Fetch preferences from database
  const {
    data: preferences,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userSearchPreferences", userId],
    queryFn: () => dbGetUserSearchPreferences(userId),
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Mutation for updating preferences
  const updateMutation = useMutation({
    mutationFn: (data: UserSearchPreferenceData) =>
      updateUserSearchPreferences(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["userSearchPreferences", userId],
      });

      // Snapshot previous value for rollback
      const previousPreferences = queryClient.getQueryData([
        "userSearchPreferences",
        userId,
      ]);

      // Optimistically update cache
      queryClient.setQueryData(
        ["userSearchPreferences", userId],
        (old: any) => ({
          ...old,
          ...newData,
          updatedAt: new Date(),
        }),
      );

      return { previousPreferences };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          ["userSearchPreferences", userId],
          context.previousPreferences,
        );
      }

      console.error("Failed to update search preferences:", error);
      toast.error("Failed to update search preferences");
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["userSearchPreferences", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["smartMatches"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });

      console.log("[SearchPreferences] Successfully updated");
    },
  });

  // Mutation for resetting preferences
  const resetMutation = useMutation({
    mutationFn: () => resetUserSearchPreferences(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userSearchPreferences", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["smartMatches"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });

      toast.success("Search preferences reset to defaults");
      console.log("[SearchPreferences] Reset to defaults");
    },
    onError: (error) => {
      console.error("Failed to reset search preferences:", error);
      toast.error("Failed to reset search preferences");
    },
  });

  // Update individual preference fields
  const updatePreference = useCallback(
    (field: keyof UserSearchPreferenceData, value: any) => {
      if (!preferences) return;

      startTransition(() => {
        updateMutation.mutate({ [field]: value });
      });
    },
    [preferences, updateMutation],
  );

  // Update multiple fields at once (atomic operation)
  const updatePreferences = useCallback(
    (data: UserSearchPreferenceData) => {
      if (!preferences) return;

      startTransition(() => {
        updateMutation.mutate(data);
      });
    },
    [preferences, updateMutation],
  );

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    startTransition(() => {
      resetMutation.mutate();
    });
  }, [resetMutation]);

  // Convenience methods for common operations
  const setGender = useCallback(
    (gender: string[]) => updatePreference("gender", gender),
    [updatePreference],
  );

  const setAgeRange = useCallback(
    (min: number, max: number) =>
      updatePreferences({ ageMin: min, ageMax: max }),
    [updatePreferences],
  );

  const setCity = useCallback(
    (city: string | null) => updatePreference("city", city),
    [updatePreference],
  );

  const setInterests = useCallback(
    (interests: string[]) => updatePreference("interests", interests),
    [updatePreference],
  );

  const toggleInterest = useCallback(
    (interest: string) => {
      if (!preferences) return;

      const currentInterests = preferences.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter((i) => i !== interest)
        : [...currentInterests, interest];

      updatePreference("interests", newInterests);
    },
    [preferences, updatePreference],
  );

  const setWithPhoto = useCallback(
    (withPhoto: boolean) => updatePreference("withPhoto", withPhoto),
    [updatePreference],
  );

  const setOrderBy = useCallback(
    (orderBy: string) => updatePreference("orderBy", orderBy),
    [updatePreference],
  );

  // Computed values
  const hasActiveFilters = preferences
    ? preferences.gender.length !== 2 ||
    preferences.ageMin !== 18 ||
    preferences.ageMax !== 65 ||
    !!preferences.city ||
    preferences.interests.length > 0 ||
    !preferences.withPhoto ||
    preferences.orderBy !== "updated"
    : false;

  const activeFiltersCount = preferences
    ? [
      preferences.gender.length !== 2 ? 1 : 0,
      preferences.ageMin !== 18 || preferences.ageMax !== 65 ? 1 : 0,
      preferences.city ? 1 : 0,
      preferences.interests.length > 0 ? 1 : 0,
      !preferences.withPhoto ? 1 : 0,
      preferences.orderBy !== "updated" ? 1 : 0,
    ].reduce((sum, val) => sum + val, 0)
    : 0;

  return {
    // Data
    preferences,
    isLoading,
    isError,
    error,
    isPending: isPending || updateMutation.isPending || resetMutation.isPending,

    // Actions
    updatePreference,
    updatePreferences,
    resetPreferences,
    refetch,

    // Convenience methods
    setGender,
    setAgeRange,
    setCity,
    setInterests,
    toggleInterest,
    setWithPhoto,
    setOrderBy,

    // Computed
    hasActiveFilters,
    activeFiltersCount,
  };
}
