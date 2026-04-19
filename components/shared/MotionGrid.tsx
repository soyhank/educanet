"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const MAX_STAGGER_INDEX = 12;

/**
 * Envuelve cada hijo con fade-in + slide-up escalonado.
 * Opcionalmente, hace scale leve al hover.
 */
export function MotionItem({
  index,
  children,
  hover = false,
}: {
  index: number;
  children: ReactNode;
  hover?: boolean;
}) {
  const delay = Math.min(index, MAX_STAGGER_INDEX) * 0.035;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: "easeOut" }}
      whileHover={hover ? { y: -2 } : undefined}
    >
      {children}
    </motion.div>
  );
}
