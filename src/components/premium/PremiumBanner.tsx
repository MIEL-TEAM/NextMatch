// components/PremiumBanner.tsx
import { Button } from "@nextui-org/react";
import Link from "next/link";

interface PremiumBannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function PremiumBanner({
  title,
  description,
  buttonText,
  buttonLink,
}: PremiumBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-300 p-6 rounded-lg shadow-md text-white mb-8">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="mb-4">{description}</p>
      <Button
        as={Link}
        href={buttonLink}
        color="primary"
        variant="shadow"
        className="bg-white text-amber-500 hover:bg-amber-100"
      >
        {buttonText}
      </Button>
    </div>
  );
}
