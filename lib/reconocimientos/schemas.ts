import { z } from "zod";

export const reconocimientoSchema = z.object({
  reconocidoEmail: z.string().email("Email invalido"),
  categoriaId: z.string().cuid(),
  mensaje: z
    .string()
    .min(20, "El mensaje debe tener al menos 20 caracteres")
    .max(500, "Maximo 500 caracteres")
    .refine((m) => m.trim().length >= 20, "Sin espacios al inicio/fin"),
  visibilidad: z.enum(["PUBLICO", "PRIVADO"]).default("PUBLICO"),
});

export type ReconocimientoInput = z.infer<typeof reconocimientoSchema>;
