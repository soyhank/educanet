-- ============================================================
-- Migración Prompt 19A — KPI Validación
-- Correr DESPUÉS de: DATABASE_URL="$DIRECT_URL" npx prisma db push --accept-data-loss
--
-- Secciones:
--   A) Marcar KpiRegistroSemanal existentes como VALIDADO
--   B) RLS policies para validación de KPIs
-- ============================================================

-- ─── A) Backfill datos históricos ─────────────────────────

-- Todos los registros pre-P19A se consideran aprobados
UPDATE "KpiRegistroSemanal"
SET
  "estadoValidacion" = 'VALIDADO'::"EstadoValidacionKpi",
  "validadoEn"       = "updatedAt"
WHERE "estadoValidacion" = 'PENDIENTE'::"EstadoValidacionKpi";

-- Confirmar distribución
SELECT
  "estadoValidacion",
  COUNT(*) AS cantidad
FROM "KpiRegistroSemanal"
GROUP BY "estadoValidacion";

-- ─── B) RLS policies para validación de KPIs ──────────────

-- Empleados editan sus propios PENDIENTES;
-- Jefes/admin actualizan estado de validación.
DROP POLICY IF EXISTS "kpi_reg_update_propio_o_admin" ON "KpiRegistroSemanal";

CREATE POLICY "kpi_reg_update_empleado_pendiente" ON "KpiRegistroSemanal"
FOR UPDATE TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM "KpiAsignacion" a
    WHERE a.id = "asignacionId"
      AND a."userId" = auth.uid()::text
  ) AND "estadoValidacion" = 'PENDIENTE')
  OR public.current_user_rol() IN ('ADMIN', 'RRHH')
  OR "validadoPorId" = auth.uid()::text
);

-- Jefe puede insertar registros EVALUADO_POR_JEFE para su equipo
CREATE POLICY "kpi_reg_insert_jefe_evaluado" ON "KpiRegistroSemanal"
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "KpiAsignacion" a
    JOIN "PuestoKpiDefinicion" d ON d.id = a."definicionId"
    WHERE a.id = "asignacionId"
      AND d."tipoFuente" = 'EVALUADO_POR_JEFE'
      AND (
        EXISTS (
          SELECT 1 FROM "User" u
          JOIN "Puesto" p ON p.id = u."puestoId"
          WHERE u.id = auth.uid()::text
            AND p.nombre LIKE 'Jefe%'
            AND u."areaId" = (SELECT "areaId" FROM "User" WHERE id = a."userId")
        )
        OR public.current_user_rol() IN ('ADMIN', 'RRHH')
      )
  )
);
