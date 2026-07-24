import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-clinical-slate-200 bg-white p-5 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
