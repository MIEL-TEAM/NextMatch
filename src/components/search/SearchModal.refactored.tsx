"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import SearchHeader from "./SearchHeader";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import InterestSelector from "./InterestSelector";
import UnifiedFilterPanel from "./UnifiedFilterPanel";
import { useSearchPreferencesStore } from "@/stores/searchPreferencesStore";
import { UserSearchPreference } from "@prisma/client";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function SearchModal({
  isOpen,
  onClose,
  userLocation,
}: SearchModalProps) {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const preferences = useSearchPreferencesStore((state) => state.preferences);
  const isHydrated = useSearchPreferencesStore((state) => state.isHydrated);
  const updatePreference = useSearchPreferencesStore((state) => state.updatePreference);
  const batchUpdate = useSearchPreferencesStore((state) => state.batchUpdate);

  const handleCityChange = useCallback(
    (city: string) => {
      updatePreference("city", city || null);
    },
    [updatePreference]
  );

  const handleInterestToggle = useCallback(
    (interest: string) => {
      if (!preferences) return;
      
      const currentInterests = preferences.interests;
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter((i) => i !== interest)
        : [...currentInterests, interest];
      
      updatePreference("interests", newInterests);
    },
    [preferences, updatePreference]
  );

  const handleGenderChange = useCallback(
    (gender: string[]) => {
      updatePreference("gender", gender);
    },
    [updatePreference]
  );

  const handleAgeRangeChange = useCallback(
    (min: number, max: number) => {
      batchUpdate({ ageMin: min, ageMax: max });
    },
    [batchUpdate]
  );

  const handleWithPhotoChange = useCallback(
    (withPhoto: boolean) => {
      updatePreference("withPhoto", withPhoto);
    },
    [updatePreference]
  );

  const handleOrderByChange = useCallback(
    (orderBy: string) => {
      updatePreference("orderBy", orderBy);
    },
    [updatePreference]
  );

  const executeSearch = useCallback(async () => {
    if (!preferences) return;

    setIsSearching(true);

    try {
      const params = new URLSearchParams();

      if (preferences.gender.length > 0 && preferences.gender.length < 2) {
        params.set("gender", preferences.gender.join(","));
      }

      if (preferences.ageMin !== 18 || preferences.ageMax !== 65) {
        params.set("ageRange", `${preferences.ageMin},${preferences.ageMax}`);
      }

      if (preferences.city) {
        const cityName = preferences.city.split(",")[0].trim();
        if (cityName) {
          params.set("city", cityName);
        }
      }

      if (preferences.interests.length > 0) {
        preferences.interests.forEach((interest) => {
          params.append("interests", interest);
        });
      }

      if (!preferences.withPhoto) {
        params.set("withPhoto", "false");
      }

      if (preferences.orderBy !== "updated") {
        params.set("orderBy", preferences.orderBy);
      }

      if (userLocation) {
        params.set("userLat", userLocation.latitude.toString());
        params.set("userLon", userLocation.longitude.toString());
        params.set("sortByDistance", "true");
      }

      router.push(`/members?${params.toString()}`);

      onClose();
    } catch (error) {
      console.error("Search execution failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [preferences, userLocation, router, onClose]);

  const canSearch =
    preferences &&
    ((preferences.city && preferences.city.length > 0) ||
      preferences.interests.length > 0 ||
      preferences.gender.length < 2 ||
      preferences.ageMin !== 18 ||
      preferences.ageMax !== 65);

  if (!isHydrated || !preferences) {
    return null;
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
                {/* Unified Filter Panel */}
                <UnifiedFilterPanel
                  preferences={preferences as UserSearchPreference}
                  onGenderChange={handleGenderChange}
                  onAgeRangeChange={handleAgeRangeChange}
                  onWithPhotoChange={handleWithPhotoChange}
                  onOrderByChange={handleOrderByChange}
                />

                {/* City Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <GooglePlacesAutocomplete
                    value={preferences.city || ""}
                    onChange={handleCityChange}
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
                      onToggleInterest={handleInterestToggle}
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
