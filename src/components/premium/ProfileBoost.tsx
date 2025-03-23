// components/ProfileBoost.tsx
"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Progress,
} from "@nextui-org/react";
import { FiZap } from "react-icons/fi";

interface ProfileBoostProps {
  isPremium: boolean;
  boostsAvailable: number;
  onBoostProfile: () => Promise<void>;
}

export default function ProfileBoost({
  isPremium,
  boostsAvailable,
  onBoostProfile,
}: ProfileBoostProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBoost = async () => {
    setIsLoading(true);
    try {
      await onBoostProfile();
    } catch (error) {
      console.error("Error boosting profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardBody>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <FiZap className="text-amber-500 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">קדם את הפרופיל שלך</h3>
            <p className="text-gray-500 text-sm">
              תן לפרופיל שלך יותר חשיפה למשך 24 שעות
            </p>
          </div>
        </div>

        {isPremium ? (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm">בוסטים זמינים</span>
              <span className="text-sm font-semibold">{boostsAvailable}</span>
            </div>
            <Progress
              value={boostsAvailable}
              maxValue={10}
              color="warning"
              className="mb-4"
            />
          </div>
        ) : (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">משתמשי פרמיום מקבלים 10 בוסטים בחודש</p>
          </div>
        )}
      </CardBody>
      <CardFooter>
        {isPremium ? (
          <Button
            color="warning"
            isDisabled={boostsAvailable <= 0 || isLoading}
            isLoading={isLoading}
            onPress={handleBoost}
            className="w-full"
            startContent={<FiZap />}
          >
            הפעל בוסט
          </Button>
        ) : (
          <Button
            as="a"
            href="/premium"
            color="warning"
            variant="flat"
            className="w-full"
          >
            שדרג לפרמיום
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
