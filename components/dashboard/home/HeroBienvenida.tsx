"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBienvenida({
  nombre,
  saludo,
  frase,
  ctaHref,
  ctaLabel,
}: {
  nombre: string;
  saludo: string;
  frase: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8"
    >
      <div className="relative z-10 max-w-xl space-y-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {saludo}, {nombre}
        </h1>
        <p className="text-muted-foreground">{frase}</p>
        {ctaHref && (
          <Button size="lg" render={<Link href={ctaHref} />}>
            {ctaLabel ?? "Continuar aprendiendo"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Decorative SVG */}
      <div className="absolute -right-8 -top-8 hidden opacity-10 sm:block">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" className="text-primary" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" className="text-primary" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" className="text-primary" />
          <path d="M100 20 L100 80 M100 120 L100 180 M20 100 L80 100 M120 100 L180 100" stroke="currentColor" strokeWidth="1" className="text-primary" />
        </svg>
      </div>
    </motion.section>
  );
}
