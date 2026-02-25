"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[18px] font-semibold text-stone-900">{children}</h2>
  );
}

export function MetaText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-[12px] text-stone-400 ${className ?? ""}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full py-2.5 rounded-md bg-stone-950 text-white text-sm font-medium
        hover:bg-stone-800 transition-colors duration-100
        disabled:bg-stone-100 disabled:text-stone-400 disabled:border disabled:border-stone-200 disabled:cursor-not-allowed
        ${className ?? ""}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          מעבד...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`w-full py-2.5 rounded-md bg-white text-stone-900 border border-stone-200 text-sm
        hover:bg-stone-50 transition-colors duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function TextLink({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[14px] text-stone-500 hover:underline bg-transparent border-none cursor-pointer ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
