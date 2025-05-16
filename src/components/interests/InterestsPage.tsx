"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import InterestSelection from "@/components/interests/InterestSelection";
import { saveUserInterests } from "@/app/actions/interestsAction";
import { toast } from "sonner";
import { availableInterests } from "@/lib/constants/interests";

type EditInterestsClientProps = {
  userId: string;
  initialSelectedInterests: string[];
};

export default function EditInterestsClient({
  userId,
  initialSelectedInterests,
}: EditInterestsClientProps) {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialSelectedInterests
  );

  const handleInterestsChange = (interests: string[]) => {
    setSelectedInterests(interests);
  };

  const handleSubmit = async () => {
    try {
      const interestObjects = selectedInterests.map((id) => {
        const interest = availableInterests.find((i) => i.id === id);
        if (!interest) {
          throw new Error(`Interest with ID ${id} not found`);
        }
        return interest;
      });

      await saveUserInterests(interestObjects);
      toast.success("תחומי העניין נשמרו בהצלחה");
      router.push(`/members/${userId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("שגיאה בשמירת תחומי עניין");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-start px-6 py-4" dir="rtl">
          <h1 className="text-2xl font-bold">הוספת תחומי עניין</h1>
          <p className="text-sm text-gray-500">
            בחר תחומי עניין כדי שנוכל לחבר אותך עם אנשים בעלי תחומי עניין דומים
          </p>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <InterestSelection
            selectedInterests={selectedInterests}
            onChange={handleInterestsChange}
          />
          <div className="flex justify-end mt-6">
            <Button color="warning" onPress={handleSubmit}>
              שמור שינויים
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
