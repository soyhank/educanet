-- ═══════════════════════════════════════════════════════════════════
-- Prompt 18 — Tareas Operativas Estandarizadas (RLS)
-- Aplicar manualmente tras `prisma db push`:
--   psql $DIRECT_URL -f supabase/rls-prompt-18-tareas.sql
-- ═══════════════════════════════════════════════════════════════════

-- CatalogoTarea: todos autenticados leen, admin/RRHH modifica
ALTER TABLE "CatalogoTarea" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_tarea_select_all" ON "CatalogoTarea";
CREATE POLICY "cat_tarea_select_all" ON "CatalogoTarea"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cat_tarea_admin" ON "CatalogoTarea";
CREATE POLICY "cat_tarea_admin" ON "CatalogoTarea"
  FOR ALL TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'))
  WITH CHECK (public.current_user_rol() IN ('ADMIN', 'RRHH'));

ALTER TABLE "ChecklistItemPlantilla" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_plantilla_select_all" ON "ChecklistItemPlantilla";
CREATE POLICY "checklist_plantilla_select_all" ON "ChecklistItemPlantilla"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "checklist_plantilla_admin" ON "ChecklistItemPlantilla";
CREATE POLICY "checklist_plantilla_admin" ON "ChecklistItemPlantilla"
  FOR ALL TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'))
  WITH CHECK (public.current_user_rol() IN ('ADMIN', 'RRHH'));

ALTER TABLE "DependenciaTarea" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dependencia_select_all" ON "DependenciaTarea";
CREATE POLICY "dependencia_select_all" ON "DependenciaTarea"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "dependencia_admin" ON "DependenciaTarea";
CREATE POLICY "dependencia_admin" ON "DependenciaTarea"
  FOR ALL TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'))
  WITH CHECK (public.current_user_rol() IN ('ADMIN', 'RRHH'));

ALTER TABLE "WorkflowPlantilla" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_plantilla_select_all" ON "WorkflowPlantilla";
CREATE POLICY "workflow_plantilla_select_all" ON "WorkflowPlantilla"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "workflow_plantilla_admin" ON "WorkflowPlantilla";
CREATE POLICY "workflow_plantilla_admin" ON "WorkflowPlantilla"
  FOR ALL TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'))
  WITH CHECK (public.current_user_rol() IN ('ADMIN', 'RRHH'));

ALTER TABLE "TareaEnWorkflow" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tarea_workflow_select_all" ON "TareaEnWorkflow";
CREATE POLICY "tarea_workflow_select_all" ON "TareaEnWorkflow"
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tarea_workflow_admin" ON "TareaEnWorkflow";
CREATE POLICY "tarea_workflow_admin" ON "TareaEnWorkflow"
  FOR ALL TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'))
  WITH CHECK (public.current_user_rol() IN ('ADMIN', 'RRHH'));

-- WorkflowInstancia: responsable general + asignados + admin
ALTER TABLE "WorkflowInstancia" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow_instancia_select" ON "WorkflowInstancia";
CREATE POLICY "workflow_instancia_select" ON "WorkflowInstancia"
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = "responsableGeneralId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
    OR EXISTS (
      SELECT 1 FROM "TareaInstancia" t
      WHERE t."workflowInstanciaId" = "WorkflowInstancia".id
      AND (t."asignadoAId" = auth.uid()::text
           OR t."ejecutadaRealmenteId" = auth.uid()::text)
    )
  );
DROP POLICY IF EXISTS "workflow_instancia_write" ON "WorkflowInstancia";
CREATE POLICY "workflow_instancia_write" ON "WorkflowInstancia"
  FOR ALL TO authenticated
  USING (
    auth.uid()::text = "responsableGeneralId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
  )
  WITH CHECK (
    auth.uid()::text = "responsableGeneralId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
  );

-- TareaInstancia: asignado + ejecutor (ayuda cruzada) + admin/RRHH
ALTER TABLE "TareaInstancia" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tarea_inst_select" ON "TareaInstancia";
CREATE POLICY "tarea_inst_select" ON "TareaInstancia"
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = "asignadoAId"
    OR auth.uid()::text = "ejecutadaRealmenteId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
    OR EXISTS (
      SELECT 1 FROM "WorkflowInstancia" w
      WHERE w.id = "workflowInstanciaId"
      AND w."responsableGeneralId" = auth.uid()::text
    )
  );
DROP POLICY IF EXISTS "tarea_inst_update_propio_o_admin" ON "TareaInstancia";
CREATE POLICY "tarea_inst_update_propio_o_admin" ON "TareaInstancia"
  FOR UPDATE TO authenticated
  USING (
    auth.uid()::text = "asignadoAId"
    OR auth.uid()::text = "ejecutadaRealmenteId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
  )
  WITH CHECK (
    auth.uid()::text = "asignadoAId"
    OR auth.uid()::text = "ejecutadaRealmenteId"
    OR public.current_user_rol() IN ('ADMIN', 'RRHH')
  );
DROP POLICY IF EXISTS "tarea_inst_insert_admin" ON "TareaInstancia";
DROP POLICY IF EXISTS "tarea_inst_insert" ON "TareaInstancia";
CREATE POLICY "tarea_inst_insert" ON "TareaInstancia"
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin/RRHH pueden crear cualquier tarea
    public.current_user_rol() IN ('ADMIN', 'RRHH')
    -- Empleado creando ad-hoc para sí mismo (requiereValidacionJefe = true)
    OR (
      auth.uid()::text = "asignadoAId"
      AND "origen" = 'AUTO_ASIGNADA'
      AND "requiereValidacionJefe" = true
    )
    -- Jefe asignando directamente a un miembro de su área
    OR (
      "origen" = 'ASIGNADA_JEFE'
      AND EXISTS (
        SELECT 1 FROM "User" jefe, "User" empleado, "Puesto" p
        WHERE jefe.id = auth.uid()::text
        AND empleado.id = "asignadoAId"
        AND jefe."puestoId" = p.id
        AND p.nombre LIKE 'Jefe%'
        AND empleado."areaId" = jefe."areaId"
      )
    )
  );
DROP POLICY IF EXISTS "tarea_inst_delete_admin" ON "TareaInstancia";
CREATE POLICY "tarea_inst_delete_admin" ON "TareaInstancia"
  FOR DELETE TO authenticated
  USING (public.current_user_rol() IN ('ADMIN', 'RRHH'));

-- ChecklistItemMarcado: ata al dueño de la TareaInstancia
ALTER TABLE "ChecklistItemMarcado" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_marcado_select" ON "ChecklistItemMarcado";
CREATE POLICY "checklist_marcado_select" ON "ChecklistItemMarcado"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "TareaInstancia" t
      WHERE t.id = "tareaInstanciaId"
      AND (t."asignadoAId" = auth.uid()::text
           OR t."ejecutadaRealmenteId" = auth.uid()::text
           OR public.current_user_rol() IN ('ADMIN', 'RRHH'))
    )
  );
DROP POLICY IF EXISTS "checklist_marcado_write" ON "ChecklistItemMarcado";
CREATE POLICY "checklist_marcado_write" ON "ChecklistItemMarcado"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "TareaInstancia" t
      WHERE t.id = "tareaInstanciaId"
      AND (t."asignadoAId" = auth.uid()::text
           OR t."ejecutadaRealmenteId" = auth.uid()::text
           OR public.current_user_rol() IN ('ADMIN', 'RRHH'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "TareaInstancia" t
      WHERE t.id = "tareaInstanciaId"
      AND (t."asignadoAId" = auth.uid()::text
           OR t."ejecutadaRealmenteId" = auth.uid()::text
           OR public.current_user_rol() IN ('ADMIN', 'RRHH'))
    )
  );
