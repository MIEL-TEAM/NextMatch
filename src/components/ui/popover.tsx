"use client";
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = ({ className, ...props }: any) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      className={`z-50 rounded-md border bg-white p-4 shadow-md ${className}`}
      align="end"
      sideOffset={8}
      {...props}
    />
  </PopoverPrimitive.Portal>
);
