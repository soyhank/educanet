"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function RachaIndicator({
  dias,
  size = "default",
  showLabel = true,
  className,
}: {
  dias: number;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const isActive = dias > 0;
  const isHot = dias >= 3;
  const isOnFire = dias >= 7;

  const sizes = {
    sm: "text-xs gap-0.5",
    default: "text-sm gap-1",
    lg: "text-base gap-1.5",
  };
  const iconSizes = { sm: "h-3.5 w-3.5", default: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold",
        isOnFire
          ? "text-orange-500"
          : isHot
            ? "text-amber-500"
            : isActive
              ? "text-amber-400"
              : "text-muted-foreground",
        sizes[size],
        className
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          isOnFire && "drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]"
        )}
      />
      <span>{dias}</span>
      {showLabel && (
        <span className="text-muted-foreground font-normal">
          {dias === 1 ? "dia" : "dias"}
        </span>
      )}
    </div>
  );
}
