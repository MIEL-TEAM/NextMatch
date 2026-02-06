"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import SearchHeader from "./SearchHeader";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import InterestSelector from "./InterestSelector";
import FilterPanel from "./FilterPanel";
import { useSearch } from "@/hooks/useSearch";
import { useFilters } from "@/hooks/useFilters";

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
  const search = useSearch({ 
    userLocation,
    onSearchComplete: onClose, // Close modal after search
  });
  const filters = useFilters();

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
              <SearchHeader
              />
            </ModalHeader>

            <ModalBody>
              <div className="space-y-4">
                {/* שימוש בקומפוננטה הקיימת! */}
                <FilterPanel filters={filters} />
                
                {/* חיפוש לפי עיר */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <GooglePlacesAutocomplete
                    value={search.citySearch}
                    onChange={search.setCitySearch}
                    onEnterPress={search.executeSearch}
                  />
                </div>

                {/* תחומי עניין */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">חיפוש לפי תחומי עניין</span>
                    <span className="text-base">🧡</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto pr-1">
                    <InterestSelector
                      selectedInterests={search.selectedInterests}
                      onToggleInterest={search.toggleInterest}
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
                onPress={search.executeSearch}
                isLoading={search.isSearching}
                isDisabled={!search.canSearch}
              >
                {search.isSearching ? "מחפש..." : "צפה/י בהתאמות"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}