"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { HiLocationMarker } from "react-icons/hi";

interface Props {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onEnterPress?: () => void;
}

export default function GooglePlacesAutocomplete({ value, onChange, onEnterPress }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    const google = (window as any).google;
    if (google?.maps?.places?.Autocomplete) {
      setIsLoaded(true);
      return;
    }
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&language=he`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error("Google Maps script failed to load");
    document.head.appendChild(script);
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const google = (window as any).google;
    if (!google?.maps?.places?.Autocomplete) return;

    const input = inputRef.current;

    autocompleteRef.current = new google.maps.places.Autocomplete(input, {
      types: ["(cities)"],
      componentRestrictions: { country: "il" },
      fields: ["formatted_address", "geometry.location", "name"],
    });

    autocompleteRef.current?.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const placeName = place.formatted_address || place.name || "";
        
        // Update parent with full details
        onChange(placeName, { lat, lng });
      } else {
        // If user cleared or typed invalid place, just update text
        const currentInput = inputRef.current?.value || "";
        onChange(currentInput);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Directly update parent state on every keystroke
    // This ensures search button is enabled and value stays in sync
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Allow enter to trigger search if we have content
      if (onEnterPress) {
        onEnterPress();
      }
    }
  };

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="mb-2">
          <Spinner size="sm" color="warning" />
        </div>
      )}
      
      <div className="relative flex items-center">
        <div className="absolute right-3 pointer-events-none z-10">
          <HiLocationMarker className="text-gray-400 text-xl" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value} // Controlled input!
          placeholder="בחר עיר או שכונה..."
          disabled={!isLoaded}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          dir="rtl"
          className="w-full px-3 py-2 pr-10 text-right border-2 border-orange-200 rounded-xl
           hover:border-orange-400 focus:border-orange-500 focus:outline-none
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
           text-sm bg-white"
        />
      </div>
    </div>
  );
}
