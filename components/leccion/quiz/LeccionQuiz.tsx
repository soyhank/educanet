"use client";

import { useState, useTransition } from "react";
import { HelpCircle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { processarIntentoQuiz } from "./quiz-client-action";
import { cn } from "@/lib/utils";
import type { QuizCompleto } from "@/types/lecciones";

type RespuestasMap = Record<string, string[]>;

export function LeccionQuiz({
  quiz,
  completada,
  mejorIntento,
}: {
  quiz: QuizCompleto;
  completada: boolean;
  mejorIntento: { puntaje: number; aprobado: boolean } | null;
}) {
  const [fase, setFase] = useState<"inicio" | "preguntas" | "resultado">("inicio");
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestasMap>({});
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof processarIntentoQuiz>> | null>(null);
  const [isPending, startTransition] = useTransition();

  const pregunta = quiz.preguntas[preguntaIdx];
  const totalPreguntas = quiz.preguntas.length;
  const seleccionadas = respuestas[pregunta?.id] ?? [];

  const toggleOpcion = (opcionId: string) => {
    if (!pregunta) return;
    setRespuestas((prev) => {
      const current = prev[pregunta.id] ?? [];
      if (pregunta.tipo === "UNICA") {
        return { ...prev, [pregunta.id]: [opcionId] };
      }
      return {
        ...prev,
        [pregunta.id]: current.includes(opcionId)
          ? current.filter((id) => id !== opcionId)
          : [...current, opcionId],
      };
    });
  };

  const enviar = () => {
    startTransition(async () => {
      try {
        const input = quiz.preguntas.map((p) => ({
          preguntaId: p.id,
          opcionIds: respuestas[p.id] ?? [],
        }));
        const res = await processarIntentoQuiz(quiz.id, input);
        setResultado(res);
        setFase("resultado");
        if (res && !("error" in res) && res.aprobado) {
          toast.success(`Quiz aprobado! +${res.puntosGanados} puntos`);
        }
      } catch {
        toast.error("Error al enviar respuestas");
      }
    });
  };

  const reiniciar = () => {
    setFase("inicio");
    setPreguntaIdx(0);
    setRespuestas({});
    setResultado(null);
  };

  // ─── Inicio ─────────────────────────────────────────────────────────────
  if (fase === "inicio") {
    return (
      <Card className="mx-auto max-w-lg space-y-4 p-6 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-xl font-bold">{quiz.titulo}</h2>
        {quiz.descripcion && (
          <p className="text-sm text-muted-foreground">{quiz.descripcion}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {totalPreguntas} preguntas · Puntaje minimo {quiz.puntajeMinimo}%
        </p>
        {mejorIntento && (
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            mejorIntento.aprobado ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-600"
          )}>
            Mejor intento: {mejorIntento.puntaje}% —{" "}
            {mejorIntento.aprobado ? "Aprobado" : "No aprobado"}
          </div>
        )}
        {completada && (
          <div className="flex items-center justify-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Ya completaste este quiz
          </div>
        )}
        <Button size="lg" onClick={() => setFase("preguntas")}>
          {completada ? "Reintentar quiz" : "Comenzar quiz"}
        </Button>
      </Card>
    );
  }

  // ─── Resultado ──────────────────────────────────────────────────────────
  if (fase === "resultado" && resultado && !("error" in resultado)) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="space-y-4 p-6 text-center">
          {resultado.aprobado ? (
            <CheckCircle className="mx-auto h-14 w-14 text-success" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-amber-500" />
          )}
          <h2 className="text-xl font-bold">
            {resultado.aprobado ? "Felicidades!" : "Casi, intentalo de nuevo"}
          </h2>
          <p className="text-3xl font-bold text-primary">
            {resultado.puntaje}%
          </p>
          <p className="text-sm text-muted-foreground">
            Minimo requerido: {resultado.puntajeMinimo}%
          </p>
          {resultado.puntosGanados > 0 && (
            <p className="text-sm text-success">
              +{resultado.puntosGanados} puntos ganados
            </p>
          )}
          <div className="flex justify-center gap-3">
            {!resultado.aprobado && (
              <Button onClick={reiniciar}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            )}
          </div>
        </Card>

        {/* Detail review */}
        <div className="space-y-3">
          <h3 className="font-semibold">Revision detallada</h3>
          {quiz.preguntas.map((p, i) => {
            const r = resultado.resultados.find(
              (r) => r.preguntaId === p.id
            );
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start gap-2">
                  {r?.correcta ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {i + 1}. {p.texto}
                    </p>
                    {r?.explicacion && (
                      <p className="text-xs text-muted-foreground">
                        {r.explicacion}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Preguntas ──────────────────────────────────────────────────────────
  const isLast = preguntaIdx === totalPreguntas - 1;
  const hasAnswer = seleccionadas.length > 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {preguntaIdx + 1} de {totalPreguntas}</span>
          <span>{pregunta.tipo === "UNICA" ? "Selecciona una" : "Selecciona varias"}</span>
        </div>
        <Progress value={((preguntaIdx + 1) / totalPreguntas) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={preguntaIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-4 p-6">
            <p className="text-lg font-medium">{pregunta.texto}</p>
            <div className="space-y-2">
              {pregunta.opciones.map((opcion) => {
                const isSelected = seleccionadas.includes(opcion.id);
                return (
                  <button
                    key={opcion.id}
                    onClick={() => toggleOpcion(opcion.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30",
                        pregunta.tipo === "MULTIPLE" && "rounded-md"
                      )}
                    >
                      {isSelected && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                    {opcion.texto}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={preguntaIdx === 0}
          onClick={() => setPreguntaIdx((p) => p - 1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        {isLast ? (
          <Button onClick={enviar} disabled={!hasAnswer || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar respuestas
          </Button>
        ) : (
          <Button
            disabled={!hasAnswer}
            onClick={() => setPreguntaIdx((p) => p + 1)}
          >
            Siguiente
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
