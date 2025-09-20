"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { MapPin, Navigation } from "lucide-react";
import {
  getCurrentLocation,
  LocationPermissionResult,
} from "@/lib/locationUtils";
import { updateCurrentUserLocation } from "@/app/actions/memberActions";
import { useRouter, useSearchParams } from "next/navigation";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted?: (coordinates: {
    latitude: number;
    longitude: number;
  }) => void;
}

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onLocationGranted,
}: LocationPermissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEnableLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: LocationPermissionResult = await getCurrentLocation();

      if (result.granted && result.coordinates) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("userLat", result.coordinates.latitude.toString());
        params.set("userLon", result.coordinates.longitude.toString());
        params.set("sortByDistance", "true");

        params.set("includeSelf", "true");

        await updateCurrentUserLocation(
          result.coordinates.latitude,
          result.coordinates.longitude
        );

        const newUrl = `/members?${params.toString()}`;
        router.replace(newUrl);

        if (onLocationGranted) {
          onLocationGranted(result.coordinates);
        }

        onClose();
      } else {
        setError(result.error || "לא ניתן לקבל את המיקום");
      }
    } catch {
      setError("שגיאה בקבלת המיקום");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      classNames={{
        backdrop:
          "bg-gradient-to-t from-amber-900/20 via-amber-900/20 to-amber-900/20",
        base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">אפשר גישה למיקום</h2>
            </ModalHeader>
            <ModalBody className="text-center">
              <p className="text-gray-300 mb-4" dir="rtl">
                כדי להציג לך אנשים קרובים אליך ולסדר לפי מרחק, אנחנו צריכים גישה
                למיקום שלך.
              </p>

              <div className="space-y-3 text-right" dir="rtl">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    הצגת משתמשים לפי קרבה גיאוגרפית
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    סינון לפי מרחק מותאם אישית
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm" dir="rtl">
                    {error}
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-400 text-xs" dir="rtl">
                  💡 המיקום שלך לא נשמר ולא נשלח לשרת - הוא משמש רק לחישוב
                  מרחקים
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-3">
              <Button
                color="default"
                variant="light"
                onPress={handleSkip}
                className="text-gray-400 hover:text-white"
              >
                דלג
              </Button>
              <Button
                color="warning"
                variant="solid"
                onPress={handleEnableLocation}
                isLoading={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
              >
                {isLoading ? "מאתר מיקום..." : "אפשר מיקום"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
