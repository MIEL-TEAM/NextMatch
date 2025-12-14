import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import {
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiArrowUpRight,
} from "react-icons/fi";
import { PremiumFeatureList } from "./PremiumFeatureList";
import { SubscribeModal } from "../modals/SubscribeModal";

interface Feature {
  text: string | React.ReactNode;
  icon: React.ReactNode;
}

interface PremiumPlanCardProps {
  title: string;
  price: string;
  description: string;
  features: Feature[];
  buttonText: string;
  isLoading: boolean;
  onActivate: () => void;
  isHighlighted?: boolean;
  planIcon?: React.ReactNode;
  isActive?: boolean;
  isCanceled?: boolean;
  canceledAt?: Date | null;
  premiumUntil?: Date | null;
  isPremium?: boolean;
  onCancel?: () => void;
}

export function PremiumPlanCard({
  title,
  price,
  description,
  features = [],
  buttonText,
  isLoading,
  onActivate,
  isHighlighted = false,
  planIcon,
  isActive = false,
  isPremium = false,
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

  const priceMatch = price.match(/^(.+?)(\s*\/\s*.+)$/);
  const mainPrice = priceMatch ? priceMatch[1] : price;
  const pricePeriod = priceMatch ? priceMatch[2] : "";

  return (
    <>
      <Card className={`w-full min-h-[600px] ${cardBorderClass}`} isHoverable>
        <CardHeader className="flex flex-col items-start pb-6 pt-6 px-6">
          <div className="flex items-center gap-3 mb-4 w-full justify-between">
            <h2 className="text-3xl font-bold">{title}</h2>

            {isHighlighted && !isActive && (
              <div className="bg-amber-400 text-white text-xs font-semibold px-3 py-1 rounded-md">
                המומלץ ביותר
              </div>
            )}

            {isActive && !isCanceled && (
              <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-md flex items-center gap-1">
                <FiCheck size={14} />
                המנוי הפעיל שלך
              </div>
            )}

            {isActive && isCanceled && (
              <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-md flex items-center gap-1">
                <FiXCircle size={14} />
                המנוי יסתיים בתאריך {formattedEndDate}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-2">{description}</p>

          <div className="mb-6">
            <span className="text-5xl font-bold">{mainPrice}</span>
            <span className="text-lg text-gray-400 mr-1">{pricePeriod}</span>
          </div>
        </CardHeader>

        <CardBody className="pt-0 px-6 pb-6 flex flex-col">
          {isActive ? (
            <>
              <div className="w-full text-center mb-3">
                {isCanceled ? (
                  <span className="text-orange-600 text-sm">
                    המנוי יסתיים בתאריך {formattedEndDate}
                  </span>
                ) : (
                  <span className="text-green-600 text-sm">המנוי פעיל כעת</span>
                )}
              </div>

              {isCanceled ? (
                <Button
                  color="primary"
                  className="w-full mb-6 h-12"
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
                    className="w-full mb-2 h-12"
                    size="lg"
                    disabled
                  >
                    התוכנית הנוכחית שלך
                  </Button>
                  {onCancel && (
                    <Button
                      color="danger"
                      variant="flat"
                      className="w-full mb-6 h-12"
                      size="lg"
                      onPress={onCancel}
                      startContent={<FiXCircle />}
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
              className="w-full mb-6 h-12 font-semibold"
              size="lg"
              isLoading={isLoading}
              onPress={() => setIsModalOpen(true)}
              startContent={isCanceled ? <FiArrowUpRight /> : undefined}
            >
              {isCanceled ? "שדרג לתוכנית זו" : buttonText}
            </Button>
          )}

          <div className="border-t border-gray-200 pt-6 mt-2">
            <div className="text-sm text-right font-medium text-gray-600 mb-4">
              הכולל:
            </div>

            <PremiumFeatureList
              features={features}
              isActive={isActive}
              isCanceled={isCanceled}
            />
          </div>
        </CardBody>
      </Card>

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
        title={title}
        price={price}
        features={features}
        planIcon={planIcon}
        isHighlighted={isHighlighted}
        isLoading={isLoading}
        isSwitchingPlan={isActive === false && isPremium === true}
        isRenewing={isActive && isCanceled}
      />
    </>
  );
}
