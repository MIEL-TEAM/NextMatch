import React from "react";

export interface SuccessMessageProps {
  message: string;
  type: "success" | "error" | "warning";
}

export function SuccessMessage({ message, type }: SuccessMessageProps) {
  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-700";
      case "error":
        return "bg-red-100 border-red-500 text-red-700";
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      default:
        return "bg-green-100 border-green-500 text-green-700";
    }
  };

  return (
    <div
      className={`${getStyles()} px-4 py-3 rounded border mb-8 text-center`}
      role="alert"
    >
      <span className="font-medium">{message}</span>
    </div>
  );
}
