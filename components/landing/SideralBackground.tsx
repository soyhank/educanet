"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// Fixed star positions — deterministic so SSR matches hydration.
const STARS: Array<[number, number, number]> = [
  // [cx%, cy%, radius(px)]
  [8, 12, 1], [22, 25, 0.8], [37, 8, 1.2], [45, 40, 0.9],
  [62, 18, 1], [71, 32, 0.7], [85, 10, 1.1], [92, 45, 0.8],
  [14, 55, 0.9], [28, 72, 1], [48, 62, 0.7], [58, 80, 1.1],
  [73, 68, 0.9], [82, 78, 0.8], [95, 62, 1],
  [5, 35, 0.7], [18, 88, 0.9], [35, 92, 0.6], [65, 95, 0.8],
  [88, 92, 0.7], [12, 72, 0.6], [40, 20, 0.7], [55, 50, 0.8],
  [78, 55, 0.6], [3, 75, 0.8],
];

export function SideralBackground() {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();

  // Parallax distinto por capa para dar profundidad.
  const yPlanet = useTransform(scrollY, [0, 1000], [0, -120]);
  const yStars = useTransform(scrollY, [0, 1000], [0, -60]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0.35]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Nebulosa — radial gradients violeta/índigo + drift sutil */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity }}
      >
        <div
          className="absolute inset-0 sideral-nebula"
          style={{
            background: `
              radial-gradient(ellipse 65% 45% at 72% 18%, hsl(var(--primary) / 0.22), transparent 60%),
              radial-gradient(ellipse 45% 35% at 18% 55%, hsl(221 83% 55% / 0.14), transparent 65%),
              radial-gradient(ellipse 50% 30% at 50% 95%, hsl(262 80% 60% / 0.1), transparent 70%)
            `,
          }}
        />
      </motion.div>

      {/* Estrellas */}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        style={{ y: yStars, opacity }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {STARS.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r * 0.15}
            fill="hsl(var(--foreground))"
            opacity={0.25 + (i % 4) * 0.15}
          />
        ))}
      </motion.svg>

      {/* Planeta con anillo — tenue, apartado hacia la derecha */}
      <motion.div
        className="absolute right-[-14rem] top-[6rem] sm:right-[-10rem] md:right-[-6rem] lg:right-[-4rem]"
        style={{ y: yPlanet, opacity }}
      >
        <svg
          width="380"
          height="380"
          viewBox="-190 -190 380 380"
          className="opacity-30 blur-[0.5px] md:opacity-40"
        >
          <defs>
            {/* Superficie — tonos apagados, sin saturación alta */}
            <radialGradient id="planet-surface" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0%" stopColor="hsl(262 45% 55%)" stopOpacity="0.55" />
              <stop offset="45%" stopColor="hsl(262 35% 35%)" stopOpacity="0.55" />
              <stop offset="90%" stopColor="hsl(240 30% 14%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(240 35% 8%)" stopOpacity="0.7" />
            </radialGradient>

            {/* Glow muy sutil */}
            <radialGradient id="planet-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="65%" stopColor="hsl(262 85% 68%)" stopOpacity="0" />
              <stop offset="85%" stopColor="hsl(262 85% 68%)" stopOpacity="0.07" />
              <stop offset="100%" stopColor="hsl(262 85% 68%)" stopOpacity="0" />
            </radialGradient>

            {/* Highlight sutil */}
            <radialGradient id="planet-highlight" cx="0.3" cy="0.25" r="0.4">
              <stop offset="0%" stopColor="white" stopOpacity="0.12" />
              <stop offset="60%" stopColor="white" stopOpacity="0.02" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Anillo — gradient muy tenue */}
            <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(262 60% 70%)" stopOpacity="0" />
              <stop offset="30%" stopColor="hsl(262 60% 72%)" stopOpacity="0.18" />
              <stop offset="50%" stopColor="hsl(262 65% 78%)" stopOpacity="0.25" />
              <stop offset="70%" stopColor="hsl(262 60% 72%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(262 60% 70%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="sideral-orbit">
            <circle r="150" fill="url(#planet-glow)" />
            <g transform="rotate(-22)">
              <ellipse
                rx="145"
                ry="32"
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth="1.2"
              />
            </g>
          </g>

          {/* Planeta */}
          <circle r="82" fill="url(#planet-surface)" />
          <circle r="82" fill="url(#planet-highlight)" />
        </svg>
      </motion.div>

      {/* Shooting star ocasional */}
      {!reduceMotion && (
        <div className="absolute inset-0">
          <div className="sideral-comet absolute -top-4 left-1/3 h-[2px] w-24 rounded-full" />
        </div>
      )}
    </div>
  );
}
