"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

export function AnimatedCard({
  children,
  className,
  delay = 0,
  ...props
}: ComponentProps<typeof Card> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "transition-shadow duration-200 hover:shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}
