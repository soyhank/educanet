-- ─────────────────────────────────────────────────────────────────────────────
-- Migración: Renombrar rangos (se retira PLATA, se agrega SIDERAL) +
-- nueva fuente TAREAS_OPERATIVAS + tope reducido de COMPROMISOS (200→100).
--
-- Correr EN SUPABASE SQL EDITOR (usa DIRECT_URL, no el pooler 6543)
-- ANTES de `npx prisma db push --accept-data-loss`.
--
-- ¿Por qué SQL manual? Postgres no permite eliminar un valor de enum si hay
-- filas referenciándolo. RangoMensual.rango='PLATA' existe en el piloto, así
-- que el enum no puede dropear PLATA mientras haya rows con ese valor.
--
-- Los puntos históricos en User.puntosTotales y TransaccionPuntos NO se tocan.
-- Solo vaciamos los snapshots mensuales (RangoMensual) — el motor los
-- reconstruye correctamente con recalcularRangoMensual().
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Borrar TODOS los snapshots de rango mensual. Se recalculan con el motor
--    al próximo evento (o al correr el seed del piloto).
DELETE FROM "RangoMensual";

-- 2. Borrar los eventos COMPROMISO_CUMPLIDO emitidos por el workflow de tareas
--    operativas del Prompt 18 (los que tienen referenciaId apuntando a una
--    TareaInstancia completada). Al migrar a la nueva fuente TAREAS_OPERATIVAS,
--    si no los borráramos quedarían como puntos "huérfanos" en COMPROMISOS
--    sin poder ser re-clasificados. Si re-ejecutás el seed se regeneran.
DELETE FROM "EventoGamificacion"
WHERE fuente = 'COMPROMISOS'
  AND tipo = 'COMPROMISO_CUMPLIDO'
  AND "referenciaId" IN (
    SELECT id FROM "TareaInstancia" WHERE "completadaEn" IS NOT NULL
  );

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- Después de correr este SQL, ejecutá localmente (el sandbox bloquea el push
-- contra la DB de producción — el usuario debe correrlo):
--
--   DATABASE_URL="$DIRECT_URL" npx prisma db push --accept-data-loss
--
-- Esto hará:
--   - Remover PLATA del enum TipoRango
--   - Agregar SIDERAL al enum TipoRango
--   - Agregar TAREAS_OPERATIVAS al enum FuenteXP
--   - Agregar TAREA_OPERATIVA_COMPLETADA al enum TipoEventoGamificacion
--   - Agregar columna RangoMensual.puntosTareasOperativas
--
-- Luego regenerá los datos del piloto con distribución de rangos de demo:
--
--   npm run db:seed-piloto
-- ─────────────────────────────────────────────────────────────────────────────
