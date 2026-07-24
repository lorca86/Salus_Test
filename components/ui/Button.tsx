import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-clinical-blue-600 text-white hover:bg-clinical-blue-700": variant === "primary",
          "bg-clinical-slate-100 text-clinical-slate-800 hover:bg-clinical-slate-200": variant === "secondary",
          "bg-transparent text-clinical-slate-600 hover:bg-clinical-slate-100": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-4 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
