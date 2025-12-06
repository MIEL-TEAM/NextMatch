import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";

import { FiRefreshCw } from "react-icons/fi";

import { PremiumFeatureList } from "./PremiumFeatureList";
import { SubscribeModal } from "../modals/SubscribeModal";
import { PremiumPlanCardProps } from "../types";

export function PremiumPlanCard({
  title,
  price,
  period,
  subline,
  description,
  features = [],
  buttonText,
  isLoading,
  onActivate,
  isHighlighted = false,
  isActive = false,
  isCanceled = false,
  premiumUntil = null,
  onCancel,
}: PremiumPlanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmUpgrade = () => {
    setIsModalOpen(false);
    onActivate();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("he-IL");
  };

  const formattedEndDate = formatDate(premiumUntil);

  const cardBorderClass = isActive
    ? isCanceled
      ? "border-2 border-orange-500"
      : "border-2 border-green-500"
    : isHighlighted
      ? "border-2 border-amber-400 shadow-xl"
      : "";

  return (
    <>
      <Card
        className={`w-full h-full flex flex-col ${cardBorderClass}`}
        isHoverable
      >
        {/* HEADER */}
        <CardHeader className="flex flex-col items-start w-full px-6 pt-6 pb-4 flex-shrink-0">
          {/* Title + Badge */}
          <div className="flex items-center justify-start gap-2 w-full mb-3 min-h-[32px]">
            <h2 className="text-2xl font-bold text-right">{title}</h2>
            {isHighlighted && !isActive && (
              <p className="bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                המומלץ ביותר
              </p>
            )}
          </div>

          {/* Description */}
          <div className="w-full mb-4 min-h-[28px]">
            {description && (
              <p className="text-lg text-neutral-600 font-medium text-right">
                {description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-start w-full gap-1 mb-4 min-h-[60px]">
            <p className="text-5xl font-bold">{price}</p>
            <span className="text-xl text-neutral-500 leading-none">/</span>
            <p className="text-sm font-medium opacity-70">{period}</p>
          </div>

          {/* Subline */}
          <div className="w-full mb-4 min-h-[24px]">
            {subline && (
              <p className="text-[16px] text-neutral-500 text-right">
                {subline}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="w-full mt-2 mb-4">
            {isActive ? (
              <>
                {isCanceled ? (
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onPress={() => setIsModalOpen(true)}
                    startContent={<FiRefreshCw />}
                    isLoading={isLoading}
                  >
                    חדש מנוי
                  </Button>
                ) : (
                  <>
                    <Button
                      color="primary"
                      variant="flat"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      התוכנית הנוכחית שלך
                    </Button>

                    {onCancel && (
                      <Button
                        color="danger"
                        variant="flat"
                        className="w-full mt-2"
                        size="lg"
                        onPress={onCancel}
                      >
                        בטל מנוי
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : (
              <Button
                color={isHighlighted ? "warning" : "primary"}
                className="w-full rounded-md"
                size="lg"
                isLoading={isLoading}
                onPress={() => setIsModalOpen(true)}
              >
                {isCanceled ? "שדרג לתוכנית זו" : buttonText}
              </Button>
            )}
          </div>

          {/* Badges */}
          <div className="w-full mb-2">
            {isActive && !isCanceled && (
              <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block">
                המנוי הפעיל שלך
              </div>
            )}
            {isActive && isCanceled && (
              <div className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block">
                המנוי יסתיים בתאריך {formattedEndDate}
              </div>
            )}
          </div>
        </CardHeader>

        {/* BODY */}
        <CardBody className="flex-1 flex flex-col px-6 pb-4">
          <PremiumFeatureList
            features={features}
            isActive={isActive}
            isCanceled={isCanceled}
          />
        </CardBody>

        {/* FOOTER */}
        <CardFooter className="flex-shrink-0 mt-auto w-full px-6 pb-6 pt-0" />
      </Card>

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
        title={title}
        price={price}
        features={features}
        isLoading={isLoading}
      />
    </>
  );
}
