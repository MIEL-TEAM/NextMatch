import { Spinner } from "@nextui-org/react";
import React from "react";
import Icon from "@/lib/table/Icon";

type StarButtonProps = {
  selected: boolean;
  loading: boolean;
};

export default function StarButton({ selected, loading }: StarButtonProps) {
  if (loading) {
    return <Spinner size="sm" color="warning" aria-label="טוען..." />;
  }

  return selected ? (
    <Icon name="star-sharp" type="sol" className="size-6 bg-yellow-500" role="img" aria-label="תמונה ראשית" />
  ) : (
    <Icon name="star-sharp" type="lit" className="size-6 bg-white" role="img" aria-label="הפוך לתמונה ראשית" />
  );
}
