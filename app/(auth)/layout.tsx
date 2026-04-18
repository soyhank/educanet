import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { AuthMotivational } from "./motivational";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      {/* Left column: form */}
      <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-12 lg:w-[60%] lg:flex-none">
        <div>
          <Link href="/" className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-bold">Educanet</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>

        <p className="text-center text-sm text-muted-foreground">
          Necesitas ayuda?{" "}
          <a
            href="mailto:soporte@educanet.local"
            className="text-primary hover:underline"
          >
            Contacta a soporte
          </a>
        </p>
      </div>

      {/* Right column: decorative (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-[40%] lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary/80 p-12">
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 text-center text-white">
          <GraduationCap className="mx-auto mb-6 h-16 w-16" />
          <AuthMotivational />
          <p className="mt-4 text-sm text-white/70">
            Capacitacion continua para tu equipo
          </p>
        </div>
      </div>
    </div>
  );
}
