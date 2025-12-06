// premium/modals/SubscribeModal.tsx
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { FiCheck } from "react-icons/fi";
import { SubscribeModalProps } from "../types";

export function SubscribeModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  price,
  features,
  planIcon,
  isHighlighted = false,
  isLoading,
  isSwitchingPlan = false,
  isRenewing = false,
}: SubscribeModalProps) {
  // Determine the header text based on action
  const getHeaderText = () => {
    if (isRenewing) return `חידוש תוכנית ${title}`;
    if (isSwitchingPlan) return `החלפת תוכנית ל${title}`;
    return `הצטרפות לתוכנית ${title}`;
  };

  // Determine the continue button text based on action
  const getButtonText = () => {
    if (isRenewing) return "חדש מנוי";
    if (isSwitchingPlan) return "החלף תוכנית";
    return "המשך לתשלום";
  };

  // Determine explanation text based on action
  const getExplanationText = () => {
    if (isRenewing)
      return `אתה עומד לחדש את המנוי שלך לתוכנית ${title} במחיר ${price}.`;
    if (isSwitchingPlan)
      return `אתה עומד להחליף את תוכנית הפרימיום שלך לתוכנית ${title} במחיר ${price}.`;
    return `אתה עומד להצטרף לתוכנית ${title} במחיר ${price}.`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      className="rtl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1">
              {getHeaderText()}
            </ModalHeader>
            <ModalBody>
              <div className="text-center py-2">
                <div className="mb-4">
                  {planIcon && (
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
                      {planIcon}
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">האם אתה בטוח?</h3>
                  <p className="text-gray-600">{getExplanationText()}</p>
                </div>

                {features.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-amber-800 mb-2 text-right">
                      היתרונות:
                    </h4>
                    <ul className="text-sm text-amber-700 text-right space-y-1">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="mr-2">{feature.text}</span>
                          <span className="text-amber-500">
                            {feature.icon || <FiCheck />}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isSwitchingPlan && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 text-right">
                      שים לב:
                    </h4>
                    <p className="text-sm text-blue-700 text-right">
                      החלפת תוכנית תחייב אותך באופן יחסי למשך הזמן שנותר בתוכנית
                      הנוכחית ולמחיר התוכנית החדשה.
                    </p>
                  </div>
                )}

                {isRenewing && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 text-right">
                      שים לב:
                    </h4>
                    <p className="text-sm text-green-700 text-right">
                      חידוש המנוי יאריך את תקופת המנוי שלך החל מתאריך הסיום
                      הנוכחי של המנוי.
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-start">
              <Button color="danger" variant="light" onPress={onClose}>
                ביטול
              </Button>
              <Button
                color={isHighlighted ? "warning" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
              >
                {getButtonText()}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
