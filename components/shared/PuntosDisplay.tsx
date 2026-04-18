"use client";

import { Sparkles } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function PuntosDisplay({
  puntos,
  size = "default",
  className,
}: {
  puntos: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, puntos, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [puntos, count]);

  const sizes = {
    sm: "text-xs gap-1",
    default: "text-sm gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSizes = { sm: "h-3 w-3", default: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold text-primary",
        sizes[size],
        className
      )}
    >
      <Sparkles className={iconSizes[size]} />
      <motion.span>{rounded}</motion.span>
    </div>
  );
}
