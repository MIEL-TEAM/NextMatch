import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  header?: string;
  body: ReactNode;
  footerButtons?: ButtonProps[];
  imageModal?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
};

export default function AppModal({
  isOpen,
  onClose,
  header,
  body,
  footerButtons,
  imageModal,
}: AppModalProps) {
  const handleClose = () => {
    setTimeout(() => onClose(), 10);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{
        base: `${
          imageModal
            ? "border-2 border-white"
            : "max-w-[95%] md:max-w-md mx-auto"
        }`,
        body: `${imageModal ? "p-0" : ""}`,
        backdrop: "bg-black/50",
        wrapper: "flex items-center justify-center",
        closeButton: imageModal 
        ? `
          top-3 left-3 
          w-9 h-9 rounded-full z-50
          bg-white/90 hover:bg-white 
          shadow-lg hover:shadow-xl 
          transition-all hover:scale-110 active:scale-95
          flex items-center justify-center
          [&>svg]:w-10 [&>svg]:h-10
          [&>svg]:stroke-[2.5]
        ` 
        : "",
      }}
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 100, transition: { duration: 0.3 } },
          exit: { y: 50, opacity: 0, transition: { duration: 0.3 } },
        },
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        {!imageModal && (
          <ModalHeader className="flex flex-col gap-1 text-center">
            {header}
          </ModalHeader>
        )}
        <ModalBody>{body}</ModalBody>

        {!imageModal && (
          <ModalFooter className="flex flex-row justify-center gap-2 px-2">
            {footerButtons &&
              footerButtons.map((props: ButtonProps, index) => (
                <Button
                  {...props}
                  key={index}
                  className={`flex-1 max-w-32 ${props.className || ""}`}
                >
                  {props.children}
                </Button>
              ))}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}