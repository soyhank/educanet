"use client";

import { CheckCircle2, Circle, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { InlineText } from "./InlineEditable";

type SaveResult = { success: true } | { success: false; error?: string };

export function ChecklistItemRow({
  itemPlantillaId,
  indice,
  descripcionOriginal,
  descripcionOverride,
  ayudaContextual,
  obligatorio,
  marcado,
  disabled = false,
  readOnly = false,
  onToggle,
  onEditarTexto,
  onEditingChange,
  size = "sm",
}: {
  itemPlantillaId: string;
  indice: number;
  descripcionOriginal: string;
  descripcionOverride: string | null;
  ayudaContextual?: string | null;
  obligatorio: boolean;
  marcado: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onToggle: (nuevo: boolean) => void;
  onEditarTexto: (nuevo: string) => Promise<SaveResult>;
  onEditingChange?: (isEditing: boolean) => void;
  size?: "sm" | "md";
}) {
  const textoVisible = descripcionOverride?.trim() || descripcionOriginal;

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const innerIcon = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  const textSize = size === "md" ? "text-sm" : "text-xs";
  const indexMr = size === "md" ? "mr-2" : "mr-1";

  return (
    <div className="flex items-start gap-2">
      <button
        type="button"
        disabled={disabled || readOnly}
        onClick={() => onToggle(!marcado)}
        className={cn(
          "mt-0.5 flex flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
          iconSize,
          marcado
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-primary",
          (disabled || readOnly) && "opacity-60 cursor-not-allowed",
        )}
        aria-label={marcado ? "Desmarcar paso" : "Marcar paso"}
      >
        {marcado ? (
          <CheckCircle2 className={innerIcon} />
        ) : (
          <Circle className={cn(innerIcon, "opacity-0")} />
        )}
      </button>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div
          className={cn(
            "flex items-start gap-1",
            marcado && "text-muted-foreground line-through",
          )}
        >
          <span className={cn("tabular-nums text-muted-foreground", textSize, indexMr)}>
            {indice}.
          </span>
          <InlineText
            value={textoVisible}
            onSave={onEditarTexto}
            readOnly={readOnly}
            allowEmpty={!!descripcionOverride}
            emptyHint="Al guardar vacío vuelve al texto original"
            placeholder="Texto del paso"
            className={cn("flex-1 min-w-0", textSize)}
            inputClassName={cn("h-auto py-1", textSize)}
            onEditingChange={onEditingChange}
          />
          {!obligatorio && (
            <span className="ml-1 text-[10px] text-muted-foreground flex-shrink-0">
              (opcional)
            </span>
          )}
        </div>
        {!!descripcionOverride && (
          <p className={cn("italic text-muted-foreground/70", size === "md" ? "text-[11px]" : "text-[10px]")}>
            Original: {descripcionOriginal}
          </p>
        )}
        {ayudaContextual && (
          <p className={cn("flex items-start gap-1 text-muted-foreground", size === "md" ? "text-xs" : "text-[11px]")}>
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            {ayudaContextual}
          </p>
        )}
      </div>
    </div>
  );
}
