"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@nextui-org/react";

import AppModal from "@/components/AppModal";

interface Feature {
  text: string;
  icon: React.ReactNode;
}

interface PremiumPlanProps {
  title: string;
  price: string;
  description: string;
  features: Feature[];
  buttonText: string;
  isLoading: boolean;
  onActivate: () => void;
  isHighlighted?: boolean;
  planIcon?: React.ReactNode;
}

export default function PremiumPlan({
  title,
  price,
  description,
  features = [],
  buttonText,
  isLoading,
  onActivate,
  isHighlighted = false,
  planIcon,
}: PremiumPlanProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const safeFeatures = Array.isArray(features) ? features : [];

  const handleConfirmUpgrade = () => {
    setIsModalOpen(false);
    onActivate();
  };

  return (
    <>
      <Card
        className={`max-w-sm ${
          isHighlighted ? "border-2 border-amber-400 shadow-xl" : ""
        }`}
        isHoverable
      >
        <CardHeader className="flex flex-col items-center pb-0">
          {planIcon && (
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-500">
              {planIcon}
            </div>
          )}

          {isHighlighted && (
            <div className="bg-amber-400 text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
              המומלץ ביותר
            </div>
          )}
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-lg font-medium mt-1">{description}</p>
        </CardHeader>

        <CardBody>
          <div className="space-y-3">
            {safeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-amber-500 flex-shrink-0">
                  {feature.icon}
                </span>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>

          <Divider className="my-4" />

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">
              ללא תשלום עכשיו (גרסת פיתוח)
            </p>
            <p className="text-2xl font-bold">{price}</p>
          </div>
        </CardBody>

        <CardFooter>
          <Button
            color={isHighlighted ? "warning" : "primary"}
            className="w-full"
            size="lg"
            isLoading={isLoading}
            onPress={() => setIsModalOpen(true)}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>

      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header={`אישור הצטרפות לתכנית ${title}`}
        body={
          <div className="text-center py-2">
            <div className="mb-4">
              {planIcon && (
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
                  {planIcon}
                </div>
              )}
              <h3 className="text-lg font-bold mb-2">האם אתה בטוח?</h3>
              <p className="text-gray-600">
                אתה עומד להצטרף לתכנית {title} במחיר {price}.
              </p>
            </div>

            {safeFeatures.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium text-amber-800 mb-2 text-right">
                  היתרונות:
                </h4>
                <ul className="text-sm text-amber-700 text-right space-y-1">
                  {safeFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span> {feature.text} </span>
                      <span className="ml-2">{feature.icon} </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
        footerButtons={[
          {
            color: "danger",
            variant: "flat",
            onPress: () => setIsModalOpen(false),
            children: "ביטול",
          },
          {
            color: isHighlighted ? "warning" : "primary",
            onPress: handleConfirmUpgrade,
            isLoading: isLoading,
            children: "אשר הצטרפות",
          },
        ]}
      />
    </>
  );
}
