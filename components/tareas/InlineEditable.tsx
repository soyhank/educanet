"use client";

/**
 * Patrón inline editing para tareas.
 *
 * Click para entrar en edición. Enter/blur guardan. Escape cancela.
 * Mientras edita, el componente muestra un ring + pulse suave indicando
 * el estado activo.
 */
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LISTA_NEGOCIOS, infoNegocio } from "@/lib/tareas/negocios";
import { BadgeNegocio } from "./SelectorNegocio";
import type { Negocio } from "@prisma/client";

type SaveResult = { success: true } | { success: false; error?: string };

// ============================================================================
// Texto inline (single line)
// ============================================================================
export function InlineText({
  value,
  onSave,
  readOnly = false,
  placeholder = "Escribir…",
  className,
  inputClassName,
  maxLength,
}: {
  value: string;
  onSave: (nuevo: string) => Promise<SaveResult>;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setLocal(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const limpio = local.trim();
    if (limpio === value.trim()) {
      setEditing(false);
      return;
    }
    if (!limpio) {
      toast.error("No puede quedar vacío");
      setLocal(value);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(limpio);
      if (!res.success) {
        toast.error(res.error ?? "Error al guardar");
        setLocal(value);
      }
      setEditing(false);
    });
  };

  if (readOnly) {
    return <span className={className}>{value}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "group relative inline-flex items-center gap-1.5 rounded-md px-1 -mx-1 text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
          className,
        )}
        title="Click para editar"
      >
        <span className="truncate">{value || placeholder}</span>
        <Pencil className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 group-focus:opacity-60" />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <Input
        ref={inputRef}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setLocal(value);
            setEditing(false);
          }
        }}
        maxLength={maxLength}
        className={cn(
          "ring-2 ring-primary/40 animate-[pulse-edit_1.5s_ease-in-out_infinite]",
          inputClassName,
        )}
        style={{
          minWidth: Math.max(180, (local.length || placeholder.length) * 8) + "px",
        }}
        disabled={isPending}
      />
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </span>
  );
}

// ============================================================================
// Textarea inline (multi-line)
// ============================================================================
export function InlineTextarea({
  value,
  onSave,
  readOnly = false,
  placeholder = "Agregar descripción",
  className,
  rows = 3,
}: {
  value: string;
  onSave: (nuevo: string) => Promise<SaveResult>;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setLocal(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    if (local === value) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(local);
      if (!res.success) {
        toast.error(res.error ?? "Error al guardar");
        setLocal(value);
      }
      setEditing(false);
    });
  };

  if (readOnly) {
    return (
      <p className={className}>{value || <span className="italic opacity-60">{placeholder}</span>}</p>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "group relative block w-full rounded-md px-2 py-1.5 -mx-2 text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
          className,
        )}
        title="Click para editar"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1">
            {value || (
              <span className="italic text-muted-foreground/70">{placeholder}</span>
            )}
          </span>
          <Pencil className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 group-focus:opacity-60" />
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <Textarea
        ref={ref}
        rows={rows}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setLocal(value);
            setEditing(false);
          } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            commit();
          }
        }}
        className="ring-2 ring-primary/40 animate-[pulse-edit_1.5s_ease-in-out_infinite]"
        disabled={isPending}
      />
      <div className="flex items-center justify-end gap-2 text-xs">
        <span className="text-muted-foreground">Ctrl+Enter guarda · Esc cancela</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocal(value);
            setEditing(false);
          }}
          disabled={isPending}
        >
          <X />
        </Button>
        <Button type="button" size="sm" onClick={commit} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Check />}
          Guardar
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Date inline (calendar popover)
// ============================================================================
export function InlineDate({
  value,
  onSave,
  label,
  className,
}: {
  value: Date;
  onSave: (nuevo: Date) => Promise<SaveResult>;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(() => value.toISOString().slice(0, 10));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setLocal(value.toISOString().slice(0, 10));
  }, [value, open]);

  const commit = () => {
    const nueva = new Date(local);
    if (nueva.toISOString().slice(0, 10) === value.toISOString().slice(0, 10)) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(nueva);
      if (!res.success) {
        toast.error(res.error ?? "Error al guardar");
      }
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-md px-1 -mx-1 text-sm transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
              className,
            )}
            title="Click para editar"
          >
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            {label && <span className="text-muted-foreground">{label}:</span>}
            <span className="tabular-nums">
              {value.toLocaleDateString("es")}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60 group-focus:opacity-60" />
          </button>
        }
      />
      <PopoverContent className="w-auto" align="start">
        <div className="space-y-2">
          <Input
            type="date"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            autoFocus
            className="ring-2 ring-primary/40"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={commit} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Check />}
              Guardar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Negocio inline (dropdown con chips de color)
// ============================================================================
export function InlineNegocio({
  value,
  onSave,
  className,
}: {
  value: Negocio | null;
  onSave: (nuevo: Negocio | null) => Promise<SaveResult>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const info = infoNegocio(value);

  const seleccionar = (nuevo: Negocio | null) => {
    if (nuevo === value) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(nuevo);
      if (!res.success) toast.error(res.error ?? "Error");
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "group inline-flex items-center gap-1 rounded-md px-1 -mx-1 text-xs transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
              className,
            )}
            title="Click para asignar marca"
            disabled={isPending}
          >
            {info ? (
              <BadgeNegocio negocio={value} />
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-1.5 py-px text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                Asignar marca
              </span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100" />
            {isPending && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </button>
        }
      />
      <PopoverContent className="w-52 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {value && (
            <button
              type="button"
              onClick={() => seleccionar(null)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="text-muted-foreground">Quitar marca</span>
            </button>
          )}
          {LISTA_NEGOCIOS.map((n) => (
            <button
              key={n.codigo}
              type="button"
              onClick={() => seleccionar(n.codigo)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                n.codigo === value && "bg-muted font-medium",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", n.dotClass)} />
              <span>{n.label}</span>
              {n.codigo === value && <Check className="ml-auto h-3 w-3 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Number inline (puntos, tiempos)
// ============================================================================
export function InlineNumber({
  value,
  onSave,
  min = 1,
  max = 9999,
  suffix,
  readOnly = false,
  className,
}: {
  value: number;
  onSave: (nuevo: number) => Promise<SaveResult>;
  min?: number;
  max?: number;
  suffix?: string;
  readOnly?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setLocal(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(local, 10);
    if (isNaN(parsed) || parsed < min || parsed > max) {
      toast.error(`Valor entre ${min} y ${max}`);
      setLocal(String(value));
      setEditing(false);
      return;
    }
    if (parsed === value) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(parsed);
      if (!res.success) {
        toast.error(res.error ?? "Error");
        setLocal(String(value));
      }
      setEditing(false);
    });
  };

  if (readOnly) {
    return (
      <span className={className}>
        {value}
        {suffix}
      </span>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "group inline-flex items-center gap-1 rounded-md px-1 -mx-1 tabular-nums transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
          className,
        )}
        title="Click para editar"
      >
        <span>
          {value}
          {suffix}
        </span>
        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setLocal(String(value));
            setEditing(false);
          }
        }}
        className="w-20 h-7 text-sm ring-2 ring-primary/40 animate-[pulse-edit_1.5s_ease-in-out_infinite]"
        disabled={isPending}
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </span>
  );
}
