"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import InterestsSection from "./InterestsSection";
import InterestSelection from "./InterestSelection";
import { updateMemberInterests } from "@/app/actions/interestsAction";
import { Interest } from "./InterestsSection";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

type EditableInterestsSectionProps = {
  interests: Interest[];
  userId: string;
  isEditable?: boolean;
};

export default function EditableInterestsSection({
  interests,
  userId,
  isEditable = true,
}: EditableInterestsSectionProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [currentInterests, setCurrentInterests] =
    useState<Interest[]>(interests);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = isEditable && session?.user?.id === userId;

  useEffect(() => {
    setCurrentInterests(interests);
  }, [interests]);

  const handleSave = async (selectedInterestIds: string[]) => {
    if (!canEdit) return;

    setIsSaving(true);
    try {
      const result = await updateMemberInterests(selectedInterestIds);
      if (result.status === "success") {
        const newInterests = selectedInterestIds.map((id) => {
          const existing = currentInterests.find((i) => i.id === id);
          return (
            existing || {
              id,
              name: id,
              icon: "✨",
              category: "other",
            }
          );
        });
        setCurrentInterests(newInterests);
        toast.success(result.data || "Interests updated successfully");
      } else {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : "Failed to update interests";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while updating interests");
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  if (!canEdit) {
    return <InterestsSection interests={currentInterests} />;
  }

  return (
    <div className="relative space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-secondary">תחומי עניין</h2>
        {!isEditing ? (
          <Button
            size="sm"
            variant="light"
            color="warning"
            onPress={() => setIsEditing(true)}
            isDisabled={isSaving}
          >
            עריכת תחומי עניין
          </Button>
        ) : (
          <Button
            size="sm"
            variant="light"
            color="default"
            onPress={() => setIsEditing(false)}
            isDisabled={isSaving}
          >
            ביטול
          </Button>
        )}
      </div>

      {isEditing ? (
        <InterestSelection
          defaultSelected={currentInterests.map((i) => i.id)}
          onChange={handleSave}
          isLoading={isSaving}
        />
      ) : (
        <InterestsSection interests={currentInterests} />
      )}
    </div>
  );
}
