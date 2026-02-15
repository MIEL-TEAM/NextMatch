"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import SearchHeader from "./SearchHeader";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import InterestSelector from "./InterestSelector";
import UnifiedFilterPanel from "./UnifiedFilterPanel";
import { useUserSearchPreferences } from "@/hooks/useUserSearchPreferences";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Use unified search preferences from database
  const {
    preferences,
    isLoading,
    setCity,
    toggleInterest,
    setGender,
    setAgeRange,
    setWithPhoto,
    setOrderBy,
    hasActiveFilters,
  } = useUserSearchPreferences({
    userId: userId || "",
    enabled: !!userId,
  });

  const executeSearch = useCallback(async () => {
    if (!preferences) return;

    setIsSearching(true);

    try {
      // STEP 1: Get updatePreferences from Zustand store
      const { updatePreferences: updateStorePreferences } =
        useSearchPreferencesStore.getState();

      // STEP 2: Update preferences (this auto-resets pagination to page 1)
      // React Query will see queryKey change and automatically refetch
      await updateStorePreferences({
        gender: preferences.gender,
        ageMin: preferences.ageMin,
        ageMax: preferences.ageMax,
        city: preferences.city,
        interests: preferences.interests,
        withPhoto: preferences.withPhoto,
        orderBy: preferences.orderBy,
      });

      // STEP 3: Close modal immediately
      // No navigation needed - React Query handles refetch automatically
      onClose();
    } catch (error) {
      console.error("Search execution failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [preferences, onClose]);

  // Can search if there are active filters or city/interests
  const canSearch =
    hasActiveFilters ||
    (preferences?.city && preferences.city.length > 0) ||
    (preferences?.interests && preferences.interests.length > 0);

  if (isLoading || !preferences || !userId) {
    return null; // Or loading skeleton
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      classNames={{
        base: "bg-white max-h-[90vh]",
        header: "border-b border-gray-200",
        body: "py-4",
        footer: "border-t border-gray-200 bg-white",
      }}
      dir="rtl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="pb-3">
              <SearchHeader />
            </ModalHeader>

            <ModalBody>
              <div className="space-y-4">
                {/* Unified Filter Panel - Single Source of Truth */}
                <UnifiedFilterPanel
                  preferences={preferences}
                  onGenderChange={setGender}
                  onAgeRangeChange={setAgeRange}
                  onWithPhotoChange={setWithPhoto}
                  onOrderByChange={setOrderBy}
                />

                {/* City Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <GooglePlacesAutocomplete
                    value={preferences.city || ""}
                    onChange={(city) => setCity(city)}
                    onEnterPress={executeSearch}
                  />
                </div>

                {/* Interests */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      חיפוש לפי תחומי עניין
                    </span>
                    <span className="text-base">🧡</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    <InterestSelector
                      selectedInterests={preferences.interests}
                      onToggleInterest={toggleInterest}
                    />
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                color="warning"
                variant="solid"
                size="lg"
                className="w-full font-bold"
                onPress={executeSearch}
                isLoading={isSearching}
                isDisabled={!canSearch}
              >
                {isSearching ? "מחפש..." : "צפה/י בהתאמות"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}