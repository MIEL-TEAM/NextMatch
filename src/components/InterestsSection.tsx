import React from "react";
import { Card, Chip } from "@nextui-org/react";

type Interest = {
  name: string;
  icon: string;
};

const getRandomInterests = (): Interest[] => [
  { name: "מוזיקה", icon: "🎵" },
  { name: "טיולים", icon: "🏔️" },
  { name: "קריאה", icon: "📚" },
  { name: "קולנוע", icon: "🎬" },
];

export default function InterestsSection() {
  const interests = getRandomInterests();

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-3 text-secondary">תחומי עניין</h2>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest, index) => (
          <Chip key={index} variant="flat" color="warning">
            <span className="mr-1">{interest.icon}</span> {interest.name}
          </Chip>
        ))}
      </div>
    </Card>
  );
}
