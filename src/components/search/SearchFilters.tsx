"use client";

import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

interface SearchFiltersProps {
  citySearch: string;
  onCityChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onEnterPress: () => void;
}

export default function SearchFilters({
  citySearch,
  onCityChange,
  onEnterPress,
}: SearchFiltersProps) {
  return (
    <GooglePlacesAutocomplete
      value={citySearch}
      onChange={onCityChange}
      onEnterPress={onEnterPress}
    />
  );
}
