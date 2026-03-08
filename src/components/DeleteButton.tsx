import { Spinner } from "@nextui-org/react";
import React from "react";
import Icon from "@/lib/table/Icon";

type DeleteButtonProps = {
  loading: boolean;
};

export default function DeleteButton({ loading }: DeleteButtonProps) {
  if (loading) {
    return <Spinner size="sm" color="danger" aria-label="מוחק..." />;
  }

  return (
    <Icon name="trash" className="size-6 bg-red-500" role="img" aria-label="מחק תמונה" />
  );
}
