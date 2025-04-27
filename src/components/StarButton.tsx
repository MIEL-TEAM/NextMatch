import { Spinner } from "@nextui-org/react";
import React from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

type StarButtonProps = {
  selected: boolean;
  loading: boolean;
};

export default function StarButton({ selected, loading }: StarButtonProps) {
  if (loading) {
    return <Spinner size="sm" color="warning" aria-label="טוען..." />;
  }

  return selected ? (
    <AiFillStar
      size={24}
      className="text-yellow-500"
      role="img"
      aria-label="תמונה ראשית"
    />
  ) : (
    <AiOutlineStar
      size={24}
      className="text-white"
      role="img"
      aria-label="הפוך לתמונה ראשית"
    />
  );
}
