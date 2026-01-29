import { CardHeader, Divider, CardBody, CardFooter } from "@nextui-org/react";
import React, { ReactNode } from "react";

type CardInnerWrapperProps = {
  header: ReactNode | string;
  body: ReactNode;
  footer?: ReactNode;
};

export default function CardInnerWrapper({
  header,
  body,
  footer,
}: CardInnerWrapperProps) {
  return (
    <>
      <CardHeader className="flex-shrink-0">
        {typeof header === "string" ? (
          <div className="text-2xl font-semibold text-secondary">{header}</div>
        ) : (
          <>{header}</>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="text-right flex-1 overflow-y-auto">{body}</CardBody>

      {footer && <CardFooter className="flex-shrink-0">{footer}</CardFooter>}
    </>
  );
}
