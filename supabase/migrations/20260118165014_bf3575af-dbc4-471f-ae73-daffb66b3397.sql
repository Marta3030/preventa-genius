
-- ============================================
-- MÓDULO INTEGRAL: Prevención + Medio Ambiente + Calidad (ISO 45001/14001/9001)
-- MVP: EPP con firma, DAS, IPER mejorado, Inspecciones con plantillas, Acciones
-- ============================================

-- ============================================
-- 1. CATÁLOGO DE ITEMS EPP (epp_catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS public.epp_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  useful_life_months INTEGER DEFAULT 12,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  requires_size BOOLEAN DEFAULT false,
  sizes_available TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. STOCK DE EPP POR CENTRO (epp_stock)
-- ============================================
CREATE TABLE IF NOT EXISTS public.epp_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID,
  area TEXT,
  epp_catalog_id UUID NOT NULL REFERENCES public.epp_catalog(id),
  size TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. ASIGNACIONES DE EPP CON FIRMA (epp_allocations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.epp_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  epp_catalog_id UUID NOT NULL REFERENCES public.epp_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  delivered_by UUID NOT NULL,
  signature_url TEXT,
  signature_date TIMESTAMPTZ,
  receipt_pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_signature',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. DERECHO A SABER (DAS) - Plantillas y Documentos
-- ============================================
CREATE TABLE IF NOT EXISTS public.das_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  position TEXT,
  area TEXT,
  content_html TEXT NOT NULL,
  risks_summary TEXT[],
  controls_summary TEXT[],
  epp_required TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.das_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.das_templates(id),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  content_snapshot TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  signature_employee_url TEXT,
  signature_employee_date TIMESTAMPTZ,
  signature_supervisor_url TEXT,
  signature_supervisor_id UUID,
  signature_supervisor_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  pdf_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. PLANTILLAS DE CHECKLIST PARA INSPECCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  target_areas TEXT[],
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. RESULTADOS DE INSPECCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id),
  template_id UUID REFERENCES public.inspection_templates(id),
  responses JSONB NOT NULL DEFAULT '{}',
  photos TEXT[],
  geolocalization JSONB,
  offline_sync BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  inspector_signature_url TEXT,
  findings_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. MÓDULO MEDIO AMBIENTE (ISO 14001)
-- ============================================
CREATE TABLE IF NOT EXISTS public.environmental_aspects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  area TEXT,
  aspect_type TEXT NOT NULL DEFAULT 'normal',
  impact_type TEXT NOT NULL,
  significance_level TEXT NOT NULL DEFAULT 'bajo',
  controls TEXT,
  legal_requirements TEXT,
  responsible_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.environmental_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'menor',
  area TEXT,
  location TEXT,
  incident_date TIMESTAMPTZ NOT NULL,
  environmental_impact TEXT,
  immediate_actions TEXT,
  root_cause TEXT,
  photos TEXT[],
  status TEXT NOT NULL DEFAULT 'open',
  reported_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.waste_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waste_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  disposal_method TEXT,
  disposal_date DATE,
  manifest_number TEXT,
  carrier TEXT,
  destination TEXT,
  area TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 8. MÓDULO CALIDAD (ISO 9001)
-- ============================================
CREATE TABLE IF NOT EXISTS public.quality_nonconformities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  nc_type TEXT NOT NULL DEFAULT 'internal',
  origin TEXT NOT NULL,
  process TEXT,
  severity TEXT NOT NULL DEFAULT 'menor',
  root_cause TEXT,
  immediate_correction TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  responsible_id UUID,
  due_date DATE,
  closed_at TIMESTAMPTZ,
  detected_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. GESTOR DE ACCIONES UNIFICADO
-- ============================================
CREATE TABLE IF NOT EXISTS public.unified_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL DEFAULT 'corrective',
  module TEXT NOT NULL DEFAULT 'prevention',
  origin_type TEXT,
  origin_id UUID,
  responsible_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  evidence_urls TEXT[],
  verification_date DATE,
  verified_by UUID,
  verification_notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. ROPA DE TRABAJO (DOTACIÓN)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workwear_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'uniforme',
  sizes_available TEXT[],
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workwear_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  workwear_catalog_id UUID NOT NULL REFERENCES public.workwear_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivered_by UUID NOT NULL,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'delivered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. CAE - GESTIÓN DE CONTRATISTAS BÁSICO
-- ============================================
CREATE TABLE IF NOT EXISTS public.contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rut TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  trade_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  activity_type TEXT,
  doc_compliance_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contractor_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contractor_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id),
  rut TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  induction_completed BOOLEAN DEFAULT false,
  induction_date DATE,
  access_authorized BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 12. KPI RECORDS PARA HISTORIAL
-- ============================================
ALTER TABLE public.kpi_records 
ADD COLUMN IF NOT EXISTS module TEXT DEFAULT 'prevention',
ADD COLUMN IF NOT EXISTS iso_standard TEXT;

-- ============================================
-- 13. ACTUALIZAR TABLA EPPS EXISTENTE (agregar firma)
-- ============================================
ALTER TABLE public.epps
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS signature_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS receipt_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS epp_catalog_id UUID REFERENCES public.epp_catalog(id);

-- ============================================
-- 14. SEQUENCES PARA CÓDIGOS ÚNICOS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS action_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS nc_code_seq START 1;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para generar código de acción
CREATE OR REPLACE FUNCTION generate_action_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'AC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('action_code_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Función para generar código de NC
CREATE OR REPLACE FUNCTION generate_nc_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code := 'NC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('nc_code_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS set_action_code ON public.unified_actions;
CREATE TRIGGER set_action_code
  BEFORE INSERT ON public.unified_actions
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION generate_action_code();

DROP TRIGGER IF EXISTS set_nc_code ON public.quality_nonconformities;
CREATE TRIGGER set_nc_code
  BEFORE INSERT ON public.quality_nonconformities
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION generate_nc_code();

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS NUEVAS
-- ============================================
ALTER TABLE public.epp_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epp_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epp_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.das_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.das_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_nonconformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workwear_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workwear_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_workers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - LECTURA AUTENTICADOS, ESCRITURA ADMINS
-- ============================================

-- EPP Catalog
CREATE POLICY "Authenticated can view epp catalog" ON public.epp_catalog FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage epp catalog" ON public.epp_catalog FOR ALL USING (is_admin(auth.uid()));

-- EPP Stock
CREATE POLICY "Authenticated can view epp stock" ON public.epp_stock FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage epp stock" ON public.epp_stock FOR ALL USING (is_admin(auth.uid()));

-- EPP Allocations
CREATE POLICY "Authenticated can view epp allocations" ON public.epp_allocations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage epp allocations" ON public.epp_allocations FOR ALL USING (is_admin(auth.uid()));

-- DAS Templates
CREATE POLICY "Authenticated can view das templates" ON public.das_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage das templates" ON public.das_templates FOR ALL USING (is_admin(auth.uid()));

-- DAS Documents
CREATE POLICY "Authenticated can view das documents" ON public.das_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage das documents" ON public.das_documents FOR ALL USING (is_admin(auth.uid()));

-- Inspection Templates
CREATE POLICY "Authenticated can view inspection templates" ON public.inspection_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage inspection templates" ON public.inspection_templates FOR ALL USING (is_admin(auth.uid()));

-- Inspection Results
CREATE POLICY "Authenticated can view inspection results" ON public.inspection_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage inspection results" ON public.inspection_results FOR ALL USING (is_admin(auth.uid()));

-- Environmental Aspects
CREATE POLICY "Authenticated can view environmental aspects" ON public.environmental_aspects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage environmental aspects" ON public.environmental_aspects FOR ALL USING (is_admin(auth.uid()));

-- Environmental Incidents
CREATE POLICY "Authenticated can view environmental incidents" ON public.environmental_incidents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage environmental incidents" ON public.environmental_incidents FOR ALL USING (is_admin(auth.uid()));

-- Waste Records
CREATE POLICY "Authenticated can view waste records" ON public.waste_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage waste records" ON public.waste_records FOR ALL USING (is_admin(auth.uid()));

-- Quality Nonconformities
CREATE POLICY "Authenticated can view quality nonconformities" ON public.quality_nonconformities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage quality nonconformities" ON public.quality_nonconformities FOR ALL USING (is_admin(auth.uid()));

-- Unified Actions
CREATE POLICY "Authenticated can view unified actions" ON public.unified_actions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage unified actions" ON public.unified_actions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Responsible can update their actions" ON public.unified_actions FOR UPDATE USING (responsible_id = auth.uid());

-- Workwear Catalog
CREATE POLICY "Authenticated can view workwear catalog" ON public.workwear_catalog FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage workwear catalog" ON public.workwear_catalog FOR ALL USING (is_admin(auth.uid()));

-- Workwear Allocations
CREATE POLICY "Authenticated can view workwear allocations" ON public.workwear_allocations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage workwear allocations" ON public.workwear_allocations FOR ALL USING (is_admin(auth.uid()));

-- Contractors
CREATE POLICY "Authenticated can view contractors" ON public.contractors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage contractors" ON public.contractors FOR ALL USING (is_admin(auth.uid()));

-- Contractor Documents
CREATE POLICY "Authenticated can view contractor documents" ON public.contractor_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage contractor documents" ON public.contractor_documents FOR ALL USING (is_admin(auth.uid()));

-- Contractor Workers
CREATE POLICY "Authenticated can view contractor workers" ON public.contractor_workers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage contractor workers" ON public.contractor_workers FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- INSERTAR DATOS DE CATÁLOGO EPP INICIALES
-- ============================================
INSERT INTO public.epp_catalog (code, name, category, useful_life_months, requires_size, sizes_available) VALUES
  ('EPP-001', 'Casco de Seguridad', 'cabeza', 36, false, NULL),
  ('EPP-002', 'Lentes de Seguridad', 'ojos', 12, false, NULL),
  ('EPP-003', 'Guantes de Seguridad', 'manos', 6, true, ARRAY['S', 'M', 'L', 'XL']),
  ('EPP-004', 'Zapatos de Seguridad', 'pies', 12, true, ARRAY['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
  ('EPP-005', 'Chaleco Reflectante', 'cuerpo', 24, true, ARRAY['S', 'M', 'L', 'XL']),
  ('EPP-006', 'Protector Auditivo', 'oídos', 12, false, NULL),
  ('EPP-007', 'Mascarilla N95', 'respiratorio', 1, false, NULL),
  ('EPP-008', 'Arnés de Seguridad', 'caidas', 60, true, ARRAY['S', 'M', 'L'])
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- INSERTAR PLANTILLA DE INSPECCIÓN INICIAL
-- ============================================
INSERT INTO public.inspection_templates (name, description, category, target_areas, fields, is_active, created_by) VALUES
  ('Inspección General de Seguridad', 'Checklist estándar para inspección de áreas de trabajo', 'seguridad', 
   ARRAY['gerencia', 'rrhh', 'operaciones', 'prevencion'],
   '[
     {"id": "orden_limpieza", "label": "Orden y limpieza general", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": false},
     {"id": "extintores", "label": "Extintores visibles y accesibles", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": true},
     {"id": "senalizacion", "label": "Señalización de seguridad adecuada", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": true},
     {"id": "rutas_evacuacion", "label": "Rutas de evacuación despejadas", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": true},
     {"id": "epp_uso", "label": "Personal usando EPP correctamente", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": true},
     {"id": "maquinaria", "label": "Maquinaria con protecciones", "type": "select", "options": ["ok", "no", "na"], "required": false, "critical": true},
     {"id": "iluminacion", "label": "Iluminación adecuada", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": false},
     {"id": "ventilacion", "label": "Ventilación adecuada", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": false},
     {"id": "pisos", "label": "Pisos en buen estado", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": false},
     {"id": "botiquin", "label": "Botiquín equipado y accesible", "type": "select", "options": ["ok", "no", "na"], "required": true, "critical": true},
     {"id": "observaciones", "label": "Observaciones generales", "type": "textarea", "required": false, "critical": false}
   ]'::jsonb,
   true,
   '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;
