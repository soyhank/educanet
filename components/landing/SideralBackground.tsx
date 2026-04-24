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

      {/* Planeta con anillo */}
      <motion.div
        className="absolute right-[-6rem] top-[4rem] sm:right-[-3rem] md:right-[4rem] lg:right-[8rem]"
        style={{ y: yPlanet, opacity }}
      >
        <svg
          width="520"
          height="520"
          viewBox="-260 -260 520 520"
          className="opacity-80 md:opacity-95"
        >
          <defs>
            {/* Superficie del planeta — radial offset para simular iluminación */}
            <radialGradient id="planet-surface" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0%" stopColor="hsl(262 95% 82%)" stopOpacity="0.95" />
              <stop offset="35%" stopColor="hsl(262 75% 55%)" stopOpacity="0.85" />
              <stop offset="85%" stopColor="hsl(240 40% 18%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(240 50% 8%)" stopOpacity="1" />
            </radialGradient>

            {/* Glow alrededor del planeta */}
            <radialGradient id="planet-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="60%" stopColor="hsl(262 85% 68%)" stopOpacity="0" />
              <stop offset="82%" stopColor="hsl(262 85% 68%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(262 85% 68%)" stopOpacity="0" />
            </radialGradient>

            {/* Highlight superior (reflejo estilo liquid glass) */}
            <radialGradient id="planet-highlight" cx="0.3" cy="0.25" r="0.4">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="60%" stopColor="white" stopOpacity="0.05" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Anillo — gradient lineal con apertura central */}
            <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(262 85% 75%)" stopOpacity="0" />
              <stop offset="25%" stopColor="hsl(262 85% 78%)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(262 90% 85%)" stopOpacity="0.55" />
              <stop offset="75%" stopColor="hsl(262 85% 78%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(262 85% 75%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Rotación ambiental lenta del conjunto anillo/glow */}
          <g className="sideral-orbit">
            {/* Glow */}
            <circle r="200" fill="url(#planet-glow)" />

            {/* Anillo — trazado detrás del planeta; el planeta lo tapa al frente */}
            <g transform="rotate(-22)">
              <ellipse
                rx="195"
                ry="44"
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth="2.2"
              />
              <ellipse
                rx="175"
                ry="38"
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          </g>

          {/* Planeta al frente */}
          <circle r="112" fill="url(#planet-surface)" />
          <circle r="112" fill="url(#planet-highlight)" />

          {/* Medio anillo al frente del planeta (arco inferior tras rotación) */}
          <g transform="rotate(-22)" className="sideral-orbit">
            <path
              d="M -195 0 A 195 44 0 0 0 195 0"
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="2.2"
              opacity="0.55"
            />
          </g>
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
