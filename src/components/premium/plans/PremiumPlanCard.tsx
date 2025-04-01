// premium/plans/PremiumPlanCard.tsx
import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@nextui-org/react";
import {
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiArrowUpRight,
} from "react-icons/fi";
import { PremiumFeatureList } from "./PremiumFeatureList";
import { SubscribeModal } from "../modals/SubscribeModal";

interface Feature {
  text: string;
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
  canceledAt = null,
  premiumUntil = null,
  onCancel,
}: PremiumPlanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmUpgrade = () => {
    setIsModalOpen(false);
    onActivate();
  };

  console.log(canceledAt);

  // Format the end date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("he-IL");
  };

  const formattedEndDate = formatDate(premiumUntil);

  // Determine card styling based on status
  const cardBorderClass = isActive
    ? isCanceled
      ? "border-2 border-orange-500"
      : "border-2 border-green-500"
    : isHighlighted
    ? "border-2 border-amber-400 shadow-xl"
    : "";

  // Determine icon container styling based on status
  const iconContainerClass = isActive
    ? isCanceled
      ? "bg-orange-100 text-orange-500"
      : "bg-green-100 text-green-500"
    : "bg-amber-100 text-amber-500";

  return (
    <>
      <Card className={`max-w-sm ${cardBorderClass}`} isHoverable>
        <CardHeader className="flex flex-col items-center pb-0">
          {planIcon && (
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconContainerClass}`}
            >
              {planIcon}
            </div>
          )}

          {/* Plan badges */}
          {isHighlighted && !isActive && (
            <div className="bg-amber-400 text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
              המומלץ ביותר
            </div>
          )}

          {isActive && !isCanceled && (
            <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-2 flex items-center">
              <FiCheck className="mr-1" />
              המנוי הפעיל שלך
            </div>
          )}

          {isActive && isCanceled && (
            <div className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-2 flex items-center">
              <FiXCircle className="mr-1" />
              המנוי יסתיים בתאריך {formattedEndDate}
            </div>
          )}

          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-lg font-medium mt-1">{description}</p>
        </CardHeader>

        <CardBody>
          <PremiumFeatureList
            features={features}
            isActive={isActive}
            isCanceled={isCanceled}
          />

          <Divider className="my-4" />

          <div className="text-center">
            <p className="text-2xl font-bold">{price}</p>
          </div>
        </CardBody>

        <CardFooter className="flex flex-col gap-2">
          {/* Different button states based on subscription status */}
          {isActive ? (
            <>
              <div className="w-full text-center mb-2">
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
                      startContent={<FiXCircle />}
                    >
                      בטל מנוי
                    </Button>
                  )}
                </>
              )}
            </>
          ) : (
            // For plans the user is not subscribed to
            <Button
              color={isHighlighted ? "warning" : "primary"}
              className="w-full"
              size="lg"
              isLoading={isLoading}
              onPress={() => setIsModalOpen(true)}
              startContent={isCanceled ? <FiArrowUpRight /> : undefined}
            >
              {isCanceled ? "שדרג לתוכנית זו" : buttonText}
            </Button>
          )}
        </CardFooter>
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
