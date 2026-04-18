import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function VerificarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold">Educanet</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Educanet — Plataforma de capacitacion y desarrollo profesional
      </footer>
    </div>
  );
}
