
-- Company/User settings table for storing API keys and company configuration
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON public.company_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compliance checks table for tracking legal compliance status
CREATE TABLE public.compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_code text NOT NULL,
  legal_reference text NOT NULL,
  category text NOT NULL DEFAULT 'ds44',
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  severity text NOT NULL DEFAULT 'warning',
  entity_type text,
  entity_id uuid,
  checked_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view compliance checks"
  ON public.compliance_checks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage compliance checks"
  ON public.compliance_checks FOR ALL
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON public.compliance_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compliance rules configuration
CREATE TABLE public.compliance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL UNIQUE,
  legal_reference text NOT NULL,
  category text NOT NULL DEFAULT 'ds44',
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'warning',
  is_active boolean DEFAULT true,
  auto_block boolean DEFAULT false,
  check_query text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view compliance rules"
  ON public.compliance_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage compliance rules"
  ON public.compliance_rules FOR ALL
  USING (is_admin(auth.uid()));

-- Insert default compliance rules based on DS44, Ley 16.744, OIT 155
INSERT INTO public.compliance_rules (rule_code, legal_reference, category, title, description, severity, auto_block) VALUES
  ('POL_SST_001', 'DS44 Art. 3', 'ds44', 'Política SST vigente', 'Debe existir política de SST firmada por gerencia y comunicada a trabajadores', 'critical', false),
  ('IPER_001', 'DS44 Art. 5', 'ds44', 'Identificación de peligros actualizada', 'Debe existir al menos una evaluación IPER activa por área operativa', 'critical', false),
  ('DAS_001', 'Ley 16.744 Art. 21', 'ley_16744', 'Derecho a Saber firmado', 'Todo trabajador debe tener DAS firmado antes de iniciar labores', 'critical', true),
  ('CAP_001', 'DS44 Art. 8', 'ds44', 'Capacitación obligatoria vigente', 'Las capacitaciones legales obligatorias deben estar vigentes', 'critical', true),
  ('INC_001', 'DS44 Art. 12', 'ds44', 'Investigación de incidentes', 'Todo incidente debe ser investigado con causa raíz identificada', 'high', false),
  ('SAL_001', 'Ley 16.744 Art. 71', 'ley_16744', 'Exámenes de salud ocupacional vigentes', 'Los exámenes de salud ocupacional deben estar al día según exposición a riesgos', 'critical', true),
  ('EPP_001', 'DS44 Art. 7', 'ds44', 'EPP entregado y firmado', 'Todo trabajador expuesto debe tener EPP entregado con acuse de recibo', 'high', false),
  ('RIOHS_001', 'Ley 16.744', 'ley_16744', 'RIOHS registrado en DT', 'El Reglamento Interno debe estar registrado ante la Dirección del Trabajo', 'critical', false),
  ('COM_001', 'DS44 Art. 15', 'ds44', 'Comité Paritario constituido', 'Empresas con 25+ trabajadores deben tener Comité Paritario activo', 'high', false),
  ('AUD_001', 'ISO 45001 9.2', 'iso_45001', 'Auditoría interna realizada', 'Debe realizarse al menos una auditoría interna del SG-SST al año', 'warning', false),
  ('DOC_001', 'DS44 Art. 18', 'ds44', 'Control documental vigente', 'Todos los documentos del SG-SST deben estar vigentes y versionados', 'high', false),
  ('ACC_001', 'DS44 Art. 14', 'ds44', 'Acciones correctivas implementadas', 'Las acciones correctivas no deben tener vencimiento sin cierre', 'high', false),
  ('PART_001', 'OIT 155 Art. 19', 'oit_155', 'Participación de trabajadores', 'Los trabajadores deben tener mecanismo de reporte de riesgos y sugerencias', 'warning', false);
