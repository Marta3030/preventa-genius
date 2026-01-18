import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// ============================================
// TYPES - EPP Catalog & Allocations
// ============================================
export interface EPPCatalogItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  useful_life_months?: number;
  unit_cost?: number;
  supplier?: string;
  requires_size: boolean;
  sizes_available?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EPPAllocation {
  id: string;
  employee_id: string;
  epp_catalog_id: string;
  quantity: number;
  size?: string;
  delivery_date: string;
  expiry_date?: string;
  delivered_by: string;
  signature_url?: string;
  signature_date?: string;
  receipt_pdf_url?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: { id: string; name: string; rut: string; position: string; area: string };
  epp_item?: EPPCatalogItem;
}

export interface EPPStock {
  id: string;
  center_id?: string;
  area?: string;
  epp_catalog_id: string;
  size?: string;
  current_stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
  epp_item?: EPPCatalogItem;
}

// ============================================
// TYPES - DAS (Derecho a Saber)
// ============================================
export interface DASTemplate {
  id: string;
  title: string;
  position?: string;
  area?: string;
  content_html: string;
  risks_summary?: string[];
  controls_summary?: string[];
  epp_required?: string[];
  version: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DASDocument {
  id: string;
  template_id?: string;
  employee_id: string;
  content_snapshot: string;
  issue_date: string;
  valid_until?: string;
  signature_employee_url?: string;
  signature_employee_date?: string;
  signature_supervisor_url?: string;
  signature_supervisor_id?: string;
  signature_supervisor_date?: string;
  status: string;
  pdf_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  employee?: { id: string; name: string; rut: string; position: string };
  template?: DASTemplate;
}

// ============================================
// TYPES - Inspection Templates & Results
// ============================================
export interface InspectionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  target_areas?: string[];
  fields: any[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionResult {
  id: string;
  inspection_id: string;
  template_id?: string;
  responses: Record<string, any>;
  photos?: string[];
  geolocalization?: { lat: number; lng: number };
  offline_sync: boolean;
  synced_at?: string;
  inspector_signature_url?: string;
  findings_summary?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES - Unified Actions
// ============================================
export interface UnifiedAction {
  id: string;
  code: string;
  title: string;
  description?: string;
  action_type: string;
  module: string;
  origin_type?: string;
  origin_id?: string;
  responsible_id: string;
  assigned_by: string;
  due_date: string;
  priority: string;
  status: string;
  progress_percentage: number;
  evidence_urls?: string[];
  verification_date?: string;
  verified_by?: string;
  verification_notes?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES - Environmental & Quality
// ============================================
export interface EnvironmentalIncident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  area?: string;
  location?: string;
  incident_date: string;
  environmental_impact?: string;
  immediate_actions?: string;
  root_cause?: string;
  photos?: string[];
  status: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export interface QualityNonconformity {
  id: string;
  code: string;
  title: string;
  description: string;
  nc_type: string;
  origin: string;
  process?: string;
  severity: string;
  root_cause?: string;
  immediate_correction?: string;
  status: string;
  responsible_id?: string;
  due_date?: string;
  closed_at?: string;
  detected_by: string;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  rut: string;
  business_name: string;
  trade_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  activity_type?: string;
  doc_compliance_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// HOOKS - EPP CATALOG
// ============================================
export function useEPPCatalog() {
  return useQuery({
    queryKey: ['epp-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('epp_catalog')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as EPPCatalogItem[];
    },
  });
}

export function useCreateEPPCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<EPPCatalogItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('epp_catalog')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epp-catalog'] });
      toast.success('Item EPP agregado al catálogo');
    },
    onError: (error) => {
      toast.error('Error al agregar item: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - EPP ALLOCATIONS
// ============================================
export function useEPPAllocations(employeeId?: string) {
  return useQuery({
    queryKey: ['epp-allocations', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('epp_allocations')
        .select(`
          *,
          employee:employees(id, name, rut, position, area),
          epp_item:epp_catalog(*)
        `)
        .order('delivery_date', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EPPAllocation[];
    },
  });
}

export function useCreateEPPAllocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (allocation: {
      employee_id: string;
      epp_catalog_id: string;
      quantity: number;
      size?: string;
      delivery_date?: string;
      expiry_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('epp_allocations')
        .insert({
          ...allocation,
          delivered_by: user?.id,
          delivery_date: allocation.delivery_date || new Date().toISOString().split('T')[0],
          status: 'pending_signature',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epp-allocations'] });
      toast.success('EPP asignado - Pendiente firma del trabajador');
    },
    onError: (error) => {
      toast.error('Error al asignar EPP: ' + error.message);
    },
  });
}

export function useSignEPPAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, signature_url }: { id: string; signature_url: string }) => {
      const { data, error } = await supabase
        .from('epp_allocations')
        .update({
          signature_url,
          signature_date: new Date().toISOString(),
          status: 'signed',
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epp-allocations'] });
      toast.success('EPP firmado correctamente');
    },
    onError: (error) => {
      toast.error('Error al firmar: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - EPP STOCK
// ============================================
export function useEPPStock() {
  return useQuery({
    queryKey: ['epp-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('epp_stock')
        .select(`
          *,
          epp_item:epp_catalog(*)
        `)
        .order('current_stock', { ascending: true });
      if (error) throw error;
      return data as EPPStock[];
    },
  });
}

// ============================================
// HOOKS - DAS TEMPLATES
// ============================================
export function useDASTemplates() {
  return useQuery({
    queryKey: ['das-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('das_templates')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });
      if (error) throw error;
      return data as DASTemplate[];
    },
  });
}

export function useCreateDASTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<DASTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'version'>) => {
      const { data, error } = await supabase
        .from('das_templates')
        .insert({
          ...template,
          created_by: user?.id,
          version: 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das-templates'] });
      toast.success('Plantilla DAS creada');
    },
    onError: (error) => {
      toast.error('Error al crear plantilla: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - DAS DOCUMENTS
// ============================================
export function useDASDocuments(employeeId?: string) {
  return useQuery({
    queryKey: ['das-documents', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('das_documents')
        .select(`
          *,
          employee:employees(id, name, rut, position),
          template:das_templates(id, title)
        `)
        .order('issue_date', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DASDocument[];
    },
  });
}

export function useCreateDASDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (doc: {
      template_id?: string;
      employee_id: string;
      content_snapshot: string;
      valid_until?: string;
    }) => {
      const { data, error } = await supabase
        .from('das_documents')
        .insert({
          ...doc,
          created_by: user?.id,
          issue_date: new Date().toISOString().split('T')[0],
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das-documents'] });
      toast.success('Documento DAS creado - Pendiente firma');
    },
    onError: (error) => {
      toast.error('Error al crear DAS: ' + error.message);
    },
  });
}

export function useSignDASDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, signature_url, role }: { id: string; signature_url: string; role: 'employee' | 'supervisor' }) => {
      const updates = role === 'employee' 
        ? { signature_employee_url: signature_url, signature_employee_date: new Date().toISOString() }
        : { signature_supervisor_url: signature_url, signature_supervisor_date: new Date().toISOString() };

      const { data, error } = await supabase
        .from('das_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Check if both signatures exist to mark as signed
      if (data.signature_employee_url && data.signature_supervisor_url) {
        await supabase
          .from('das_documents')
          .update({ status: 'signed' })
          .eq('id', id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['das-documents'] });
      toast.success('Documento firmado');
    },
    onError: (error) => {
      toast.error('Error al firmar: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - INSPECTION TEMPLATES
// ============================================
export function useInspectionTemplates() {
  return useQuery({
    queryKey: ['inspection-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspection_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as InspectionTemplate[];
    },
  });
}

export function useCreateInspectionTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('inspection_templates')
        .insert({
          ...template,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-templates'] });
      toast.success('Plantilla de inspección creada');
    },
    onError: (error) => {
      toast.error('Error al crear plantilla: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - INSPECTION RESULTS
// ============================================
export function useInspectionResults(inspectionId?: string) {
  return useQuery({
    queryKey: ['inspection-results', inspectionId],
    queryFn: async () => {
      let query = supabase
        .from('inspection_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (inspectionId) {
        query = query.eq('inspection_id', inspectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InspectionResult[];
    },
  });
}

export function useCreateInspectionResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: Omit<InspectionResult, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('inspection_results')
        .insert(result)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-results'] });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Resultados de inspección guardados');
    },
    onError: (error) => {
      toast.error('Error al guardar resultados: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - UNIFIED ACTIONS
// ============================================
export function useUnifiedActions(filters?: { module?: string; status?: string; responsible_id?: string }) {
  return useQuery({
    queryKey: ['unified-actions', filters],
    queryFn: async () => {
      let query = supabase
        .from('unified_actions')
        .select('*')
        .order('due_date', { ascending: true });

      if (filters?.module) {
        query = query.eq('module', filters.module);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.responsible_id) {
        query = query.eq('responsible_id', filters.responsible_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UnifiedAction[];
    },
  });
}

export function useCreateUnifiedAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (action: Omit<UnifiedAction, 'id' | 'code' | 'created_at' | 'updated_at' | 'assigned_by'>) => {
      const { data, error } = await supabase
        .from('unified_actions')
        .insert({
          ...action,
          assigned_by: user?.id,
          code: '', // Will be auto-generated by trigger
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-actions'] });
      toast.success('Acción creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear acción: ' + error.message);
    },
  });
}

export function useUpdateUnifiedAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UnifiedAction> & { id: string }) => {
      const { data, error } = await supabase
        .from('unified_actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-actions'] });
      toast.success('Acción actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - ENVIRONMENTAL
// ============================================
export function useEnvironmentalIncidents() {
  return useQuery({
    queryKey: ['environmental-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_incidents')
        .select('*')
        .order('incident_date', { ascending: false });
      if (error) throw error;
      return data as EnvironmentalIncident[];
    },
  });
}

export function useCreateEnvironmentalIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (incident: Omit<EnvironmentalIncident, 'id' | 'created_at' | 'updated_at' | 'reported_by'>) => {
      const { data, error } = await supabase
        .from('environmental_incidents')
        .insert({
          ...incident,
          reported_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmental-incidents'] });
      toast.success('Incidente ambiental reportado');
    },
    onError: (error) => {
      toast.error('Error al reportar: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - QUALITY
// ============================================
export function useQualityNonconformities() {
  return useQuery({
    queryKey: ['quality-nonconformities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_nonconformities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as QualityNonconformity[];
    },
  });
}

export function useCreateQualityNC() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (nc: Omit<QualityNonconformity, 'id' | 'code' | 'created_at' | 'updated_at' | 'detected_by'>) => {
      const { data, error } = await supabase
        .from('quality_nonconformities')
        .insert({
          ...nc,
          detected_by: user?.id,
          code: '', // Will be auto-generated by trigger
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-nonconformities'] });
      toast.success('No conformidad registrada');
    },
    onError: (error) => {
      toast.error('Error al registrar NC: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - CONTRACTORS (CAE)
// ============================================
export function useContractors() {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('business_name', { ascending: true });
      if (error) throw error;
      return data as Contractor[];
    },
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractor: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contractors')
        .insert(contractor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast.success('Contratista registrado');
    },
    onError: (error) => {
      toast.error('Error al registrar: ' + error.message);
    },
  });
}

// ============================================
// HOOKS - KPIs INTEGRALES
// ============================================
export function useIntegralKPIs() {
  const { data: eppAllocations } = useEPPAllocations();
  const { data: dasDocuments } = useDASDocuments();
  const { data: actions } = useUnifiedActions();
  const { data: envIncidents } = useEnvironmentalIncidents();
  const { data: qualityNCs } = useQualityNonconformities();

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    epp: {
      total: eppAllocations?.length || 0,
      pending_signature: eppAllocations?.filter(e => e.status === 'pending_signature').length || 0,
      expiring_30d: eppAllocations?.filter(e => {
        if (!e.expiry_date) return false;
        const expiry = new Date(e.expiry_date);
        return expiry <= thirtyDaysFromNow && expiry >= today;
      }).length || 0,
    },
    das: {
      total: dasDocuments?.length || 0,
      pending: dasDocuments?.filter(d => d.status === 'pending').length || 0,
      signed: dasDocuments?.filter(d => d.status === 'signed').length || 0,
    },
    actions: {
      total: actions?.length || 0,
      pending: actions?.filter(a => a.status === 'pending').length || 0,
      in_progress: actions?.filter(a => a.status === 'in_progress').length || 0,
      overdue: actions?.filter(a => {
        if (a.status === 'completed') return false;
        return new Date(a.due_date) < today;
      }).length || 0,
    },
    environmental: {
      incidents_open: envIncidents?.filter(i => i.status === 'open').length || 0,
    },
    quality: {
      ncs_open: qualityNCs?.filter(nc => nc.status === 'open').length || 0,
    },
  };
}
