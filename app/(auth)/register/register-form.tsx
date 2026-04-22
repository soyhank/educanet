"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { passwordStrength } from "@/lib/auth-schemas";
import { registerAction } from "../actions";

const strengthLabels = ["", "Debil", "Aceptable", "Fuerte", "Excelente"];
const strengthColors = [
  "bg-muted",
  "bg-destructive",
  "bg-warning",
  "bg-success",
  "bg-primary",
];

type AreaConPuestos = {
  id: string;
  nombre: string;
  puestos: { id: string; nombre: string; nivel: number }[];
};

function Requirement({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        ok ? "text-success" : "text-muted-foreground"
      }`}
    >
      {ok ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <X className="h-3 w-3 shrink-0 opacity-60" />
      )}
      <span>{children}</span>
    </li>
  );
}

export function RegisterForm({ areas }: { areas: AreaConPuestos[] }) {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [areaId, setAreaId] = useState<string>("");
  const [puestoId, setPuestoId] = useState<string>("");
  const strength = passwordStrength(password);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const puestosDelArea = useMemo(
    () => areas.find((a) => a.id === areaId)?.puestos ?? [],
    [areas, areaId]
  );

  const fieldErrors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  useEffect(() => {
    if (values.areaId) setAreaId(values.areaId);
    if (values.puestoId) setPuestoId(values.puestoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            name="nombre"
            required
            autoComplete="given-name"
            defaultValue={values.nombre ?? ""}
            aria-invalid={!!fieldErrors.nombre}
          />
          {fieldErrors.nombre && (
            <p className="text-xs text-destructive">{fieldErrors.nombre}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            name="apellido"
            required
            autoComplete="family-name"
            defaultValue={values.apellido ?? ""}
            aria-invalid={!!fieldErrors.apellido}
          />
          {fieldErrors.apellido && (
            <p className="text-xs text-destructive">{fieldErrors.apellido}</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <Label htmlFor="email">Correo electronico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@empresa.com"
          autoComplete="email"
          required
          defaultValue={values.email ?? ""}
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <Label htmlFor="areaSelect">Area / Equipo</Label>
          <input type="hidden" name="areaId" value={areaId} />
          <Select
            value={areaId}
            onValueChange={(v) => {
              setAreaId(v ?? "");
              setPuestoId("");
            }}
          >
            <SelectTrigger
              id="areaSelect"
              className="w-full"
              aria-invalid={!!fieldErrors.areaId}
            >
              <SelectValue placeholder="Selecciona tu area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.areaId && (
            <p className="text-xs text-destructive">{fieldErrors.areaId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="puestoSelect">Puesto</Label>
          <input type="hidden" name="puestoId" value={puestoId} />
          <Select
            value={puestoId}
            onValueChange={(v) => setPuestoId(v ?? "")}
            disabled={!areaId}
          >
            <SelectTrigger
              id="puestoSelect"
              className="w-full"
              aria-invalid={!!fieldErrors.puestoId}
            >
              <SelectValue
                placeholder={areaId ? "Selecciona" : "Elige un area"}
              />
            </SelectTrigger>
            <SelectContent>
              {puestosDelArea.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.puestoId && (
            <p className="text-xs text-destructive">{fieldErrors.puestoId}</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <Label htmlFor="password">Contrasena</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby="password-requirements"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar" : "Mostrar"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <ul
          id="password-requirements"
          className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1"
        >
          <Requirement ok={hasMinLength}>Minimo 8 caracteres</Requirement>
          <Requirement ok={hasUppercase}>Una mayuscula (A-Z)</Requirement>
          <Requirement ok={hasLowercase}>Una minuscula (a-z)</Requirement>
          <Requirement ok={hasNumber}>Un numero (0-9)</Requirement>
        </ul>

        {password.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    strength >= level ? strengthColors[strength] : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {strengthLabels[strength]}
            </p>
          </div>
        )}

        {fieldErrors.password && (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={!!fieldErrors.confirmPassword}
        />
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex items-start gap-2"
      >
        <input
          type="checkbox"
          id="acepteTerminos"
          name="acepteTerminos"
          className="mt-1 h-4 w-4 rounded border-border"
          required
          defaultChecked={values.acepteTerminos === "on"}
        />
        <Label htmlFor="acepteTerminos" className="text-sm font-normal leading-5">
          Acepto los{" "}
          <Link href="/terminos" className="text-primary hover:underline">
            terminos y condiciones
          </Link>
        </Label>
      </motion.div>
      {fieldErrors.acepteTerminos && (
        <p className="-mt-2 text-xs text-destructive">
          {fieldErrors.acepteTerminos}
        </p>
      )}

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear cuenta
        </Button>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
