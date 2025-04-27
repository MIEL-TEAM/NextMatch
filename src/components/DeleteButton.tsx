import { Spinner } from "@nextui-org/react";
import React from "react";
import { CgTrash } from "react-icons/cg";

type DeleteButtonProps = {
  loading: boolean;
};

export default function DeleteButton({ loading }: DeleteButtonProps) {
  if (loading) {
    return <Spinner size="sm" color="danger" aria-label="מוחק..." />;
  }

  return (
    <CgTrash
      size={24}
      className="text-red-500"
      role="img"
      aria-label="מחק תמונה"
    />
  );
}
