-- =============================================
-- MÓDULO PREVENCIÓN COMPLETO - Tablas y funciones
-- =============================================

-- Tabla de empleados (base para todo el sistema)
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rut TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    area public.area_type NOT NULL,
    date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    blocked_for_tasks BOOLEAN NOT NULL DEFAULT false,
    blocked_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investigaciones de incidentes
CREATE TABLE public.incident_investigations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    investigator_id UUID NOT NULL,
    root_cause TEXT,
    contributing_factors TEXT[],
    immediate_actions TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Acciones correctivas (CAPA)
CREATE TABLE public.corrective_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    investigation_id UUID REFERENCES public.incident_investigations(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    action_type TEXT NOT NULL DEFAULT 'corrective' CHECK (action_type IN ('corrective', 'preventive', 'improvement')),
    owner_id UUID NOT NULL,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'cancelled')),
    evidence_url TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EPPs (Equipos de Protección Personal)
CREATE TABLE public.epps (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    item_code TEXT,
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'returned', 'damaged')),
    notes TEXT,
    issued_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registros de KPIs históricos
CREATE TABLE public.kpi_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(10,4) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    area public.area_type,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logs de auditoría
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    prev_value JSONB,
    new_value JSONB,
    user_id UUID NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alertas del sistema
CREATE TABLE public.alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    entity_type TEXT,
    entity_id UUID,
    target_roles public.app_role[],
    target_areas public.area_type[],
    target_users UUID[],
    read_by UUID[] DEFAULT '{}',
    dismissed_by UUID[] DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agregar columnas faltantes a incidents
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'accident' CHECK (type IN ('accident', 'incident', 'near_miss', 'occupational_disease')),
ADD COLUMN IF NOT EXISTS employees_involved UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS immediate_actions TEXT,
ADD COLUMN IF NOT EXISTS witnesses TEXT[];

-- Agregar columnas a trainings
ALTER TABLE public.trainings
ADD COLUMN IF NOT EXISTS juridical_basis TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'company' CHECK (type IN ('legal', 'company')),
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER;

-- Enable RLS on all new tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "All authenticated can view employees" ON public.employees
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage employees" ON public.employees
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for incident_investigations
CREATE POLICY "All authenticated can view investigations" ON public.incident_investigations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage investigations" ON public.incident_investigations
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Assigned investigators can update" ON public.incident_investigations
    FOR UPDATE USING (investigator_id = auth.uid());

-- RLS Policies for corrective_actions
CREATE POLICY "All authenticated can view corrective actions" ON public.corrective_actions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage corrective actions" ON public.corrective_actions
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Owners can update their actions" ON public.corrective_actions
    FOR UPDATE USING (owner_id = auth.uid());

-- RLS Policies for epps
CREATE POLICY "All authenticated can view epps" ON public.epps
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage epps" ON public.epps
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for kpi_records
CREATE POLICY "All authenticated can view kpi records" ON public.kpi_records
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage kpi records" ON public.kpi_records
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for audit_logs (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for alerts
CREATE POLICY "Users can view relevant alerts" ON public.alerts
    FOR SELECT USING (
        target_users IS NULL 
        OR auth.uid() = ANY(target_users)
        OR EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND (target_roles IS NULL OR ur.role = ANY(target_roles))
        )
    );

CREATE POLICY "Admins can manage alerts" ON public.alerts
    FOR ALL USING (public.is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_investigations_updated_at
    BEFORE UPDATE ON public.incident_investigations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_corrective_actions_updated_at
    BEFORE UPDATE ON public.corrective_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_epps_updated_at
    BEFORE UPDATE ON public.epps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

-- Función para calcular KPIs de prevención
CREATE OR REPLACE FUNCTION public.calculate_prevention_kpis(
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_workers INTEGER;
    v_accidents_with_leave INTEGER;
    v_days_lost INTEGER;
    v_total_hours DECIMAL;
    v_tf DECIMAL;
    v_tgr DECIMAL;
    v_training_compliance DECIMAL;
    v_inspections_done INTEGER;
    v_inspections_planned INTEGER;
    v_open_incidents INTEGER;
    v_overdue_actions INTEGER;
BEGIN
    -- Count active workers
    SELECT COUNT(*) INTO v_total_workers 
    FROM employees WHERE status = 'active';
    
    -- Accidents with leave (days_lost > 0)
    SELECT COUNT(*), COALESCE(SUM(days_lost), 0)
    INTO v_accidents_with_leave, v_days_lost
    FROM incidents 
    WHERE incident_date BETWEEN p_start_date AND p_end_date
    AND days_lost > 0;
    
    -- Estimate hours worked (workers * 45hrs/week * weeks in period)
    v_total_hours := v_total_workers * 45 * ((p_end_date - p_start_date)::DECIMAL / 7);
    
    -- Calculate TF and TGR
    IF v_total_workers > 0 THEN
        v_tf := (v_accidents_with_leave * 1000.0) / v_total_workers;
    ELSE
        v_tf := 0;
    END IF;
    
    IF v_total_hours > 0 THEN
        v_tgr := (v_days_lost * 1000.0) / v_total_hours;
    ELSE
        v_tgr := 0;
    END IF;
    
    -- Training compliance
    SELECT 
        CASE WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'completado' AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)))::DECIMAL / COUNT(*)::DECIMAL * 100
        ELSE 100 END
    INTO v_training_compliance
    FROM employee_trainings;
    
    -- Inspections
    SELECT 
        COUNT(*) FILTER (WHERE status = 'completada'),
        COUNT(*)
    INTO v_inspections_done, v_inspections_planned
    FROM inspections
    WHERE planned_date BETWEEN p_start_date AND p_end_date;
    
    -- Open incidents
    SELECT COUNT(*) INTO v_open_incidents
    FROM incidents 
    WHERE investigation_status != 'cerrado';
    
    -- Overdue actions
    SELECT COUNT(*) INTO v_overdue_actions
    FROM corrective_actions
    WHERE status = 'pending' AND due_date < CURRENT_DATE;
    
    RETURN jsonb_build_object(
        'total_workers', v_total_workers,
        'accidents_with_leave', v_accidents_with_leave,
        'days_lost', v_days_lost,
        'tf', ROUND(v_tf, 2),
        'tgr', ROUND(v_tgr, 4),
        'training_compliance', ROUND(v_training_compliance, 1),
        'inspections_done', v_inspections_done,
        'inspections_planned', v_inspections_planned,
        'inspections_compliance', CASE WHEN v_inspections_planned > 0 
            THEN ROUND((v_inspections_done::DECIMAL / v_inspections_planned) * 100, 1) 
            ELSE 100 END,
        'open_incidents', v_open_incidents,
        'overdue_actions', v_overdue_actions,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
END;
$$;