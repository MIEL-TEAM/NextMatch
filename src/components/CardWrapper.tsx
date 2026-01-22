import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";
import { ReactNode } from "react";
import { IconType } from "react-icons/lib";

type CardWrapperProps = {
  children?: ReactNode;
  body?: ReactNode;
  headerIcon: IconType;
  headerText: string;
  subHeaderText?: string;
  action?: () => void;
  actionLabel?: string;
  footer?: ReactNode;
};

export default function CardWrapper({
  children,
  body,
  headerIcon: Icon,
  headerText,
  subHeaderText,
  action,
  actionLabel,
  footer,
}: CardWrapperProps) {
  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6">
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 shadow-lg rounded-xl">
        <CardHeader className="flex flex-col items-center justify-center">
          <div className="flex flex-col gap-2 items-center text-secondary">
            <div className="flex flex-row items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {headerText}
              </h1>
              <Icon size={30} />
            </div>
            {subHeaderText && (
              <p className="text-neutral-500 text-sm sm:text-base text-center">
                {subHeaderText}
              </p>
            )}
          </div>
        </CardHeader>

        {(children || body) && <CardBody>{body || children}</CardBody>}

        <CardFooter className="w-full">
          {action && (
            <Button
              onPress={action}
              fullWidth
              color="secondary"
              variant="bordered"
              className="text-base sm:text-lg"
            >
              {actionLabel}
            </Button>
          )}
          {footer && <div className="mt-4">{footer}</div>}
        </CardFooter>
      </Card>
    </div>
  );
}
