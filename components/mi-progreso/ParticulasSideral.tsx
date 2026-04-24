"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Partículas cósmicas para decorar el fondo del card de rango Sideral.
 * Respeta `prefers-reduced-motion` — si el usuario tiene esa preferencia,
 * se renderizan estáticas.
 */
export function ParticulasSideral({ cantidad = 12 }: { cantidad?: number }) {
  const reducirMovimiento = useReducedMotion();
  const [seeds, setSeeds] = useState<
    Array<{ x: number; y: number; size: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    setSeeds(
      Array.from({ length: cantidad }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      }))
    );
  }, [cantidad]);

  if (seeds.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {seeds.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-violet-200 dark:bg-violet-100"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            boxShadow: "0 0 8px rgba(196, 181, 253, 0.8)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            reducirMovimiento
              ? { opacity: 0.4, scale: 1 }
              : {
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5],
                }
          }
          transition={
            reducirMovimiento
              ? { duration: 0 }
              : {
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
