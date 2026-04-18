import Link from "next/link";
import { GraduationCap, BookOpen, Trophy, Award, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [cursosCount, certificadosCount, usuariosCount] = await Promise.all([
    prisma.curso.count({ where: { publicado: true } }),
    prisma.certificado.count(),
    prisma.user.count({ where: { activo: true } }),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-7 w-7" />
            <span className="text-xl font-bold">educanet</span>
          </div>
          <Button size="sm" render={<Link href="/login" />}>
            Iniciar sesion
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Crece con tu empresa,{" "}
          <span className="text-primary">crece contigo</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Educanet es la plataforma interna de desarrollo profesional. Aprende,
          obtén certificados verificables y avanza en tu carrera.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" render={<Link href="/login" />}>
            Iniciar sesion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/verificar" />}>
            Verificar certificado
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold mb-12">
            Todo lo que necesitas para crecer
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: "Cursos a tu medida", desc: "Contenido disenado para tu rol y area" },
              { icon: Trophy, title: "Gamificacion", desc: "Puntos, badges y rankings que motivan" },
              { icon: Award, title: "Certificados", desc: "Certificados verificables con QR" },
              { icon: TrendingUp, title: "Tu carrera", desc: "Visualiza tu camino de crecimiento" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{cursosCount}</p>
              <p className="text-sm text-muted-foreground">Cursos disponibles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{certificadosCount}</p>
              <p className="text-sm text-muted-foreground">Certificados emitidos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{usuariosCount}</p>
              <p className="text-sm text-muted-foreground">Trabajadores creciendo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p>Educanet — Plataforma de crecimiento profesional</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Iniciar sesion</Link>
            <Link href="/verificar" className="hover:text-foreground">Verificar certificado</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
