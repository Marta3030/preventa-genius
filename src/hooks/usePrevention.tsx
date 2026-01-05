import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AreaType = Database['public']['Enums']['area_type'];
type IncidentSeverity = Database['public']['Enums']['incident_severity'];
type RiskLevel = Database['public']['Enums']['risk_level'];
type DocumentType = Database['public']['Enums']['document_type'];

// Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  area: AreaType;
  severity: IncidentSeverity;
  incident_date: string;
  location?: string;
  type?: string;
  days_lost?: number;
  reported_by: string;
  assigned_to?: string;
  investigation_status?: string;
  investigation_notes?: string;
  corrective_actions?: string;
  employees_involved?: string[];
  photos?: string[];
  immediate_actions?: string;
  witnesses?: string[];
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  title: string;
  description?: string;
  area: AreaType;
  probability: number;
  severity: number;
  residual_risk: RiskLevel;
  controls?: string;
  status: string;
  responsible_user_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Training {
  id: string;
  title: string;
  description?: string;
  duration_hours?: number;
  expiry_months?: number;
  is_legal_requirement?: boolean;
  juridical_basis?: string;
  type?: string;
  recurrence_days?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTraining {
  id: string;
  training_id: string;
  user_id: string;
  status: string;
  completed_at?: string;
  expiry_date?: string;
  certificate_url?: string;
  created_at: string;
  training?: Training;
}

export interface Document {
  id: string;
  title: string;
  document_type: DocumentType;
  file_url: string;
  version: number;
  is_active: boolean;
  expiry_date?: string;
  registered_with_dt?: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentAcknowledgement {
  id: string;
  document_id: string;
  user_id: string;
  acknowledged_at: string;
  ip_address?: string;
}

export interface Inspection {
  id: string;
  title: string;
  area: AreaType;
  inspector_id: string;
  planned_date: string;
  completed_date?: string;
  status: string;
  checklist?: any;
  findings_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  entity_type?: string;
  entity_id?: string;
  read_by?: string[];
  dismissed_by?: string[];
  created_at: string;
}

export interface CorrectiveAction {
  id: string;
  investigation_id?: string;
  incident_id?: string;
  title: string;
  description?: string;
  action_type: string;
  owner_id: string;
  due_date: string;
  completed_at?: string;
  status: string;
  priority: string;
  evidence_url?: string;
  created_at: string;
}

export interface PreventionKPIs {
  total_workers: number;
  accidents_with_leave: number;
  days_lost: number;
  tf: number;
  tgr: number;
  training_compliance: number;
  inspections_done: number;
  inspections_planned: number;
  inspections_compliance: number;
  open_incidents: number;
  overdue_actions: number;
  period_start: string;
  period_end: string;
}

// Hooks
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('incident_date', { ascending: false });
      if (error) throw error;
      return data as Incident[];
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'reported_by'>) => {
      const { data, error } = await supabase
        .from('incidents')
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
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['prevention-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Incidente reportado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al reportar incidente: ' + error.message);
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Incident> & { id: string }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['prevention-kpis'] });
      toast.success('Incidente actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

export function useRisks() {
  return useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Risk[];
    },
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (risk: Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('risks')
        .insert({
          ...risk,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success('Riesgo creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear riesgo: ' + error.message);
    },
  });
}

export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Training[];
    },
  });
}

export function useEmployeeTrainings(userId?: string) {
  return useQuery({
    queryKey: ['employee-trainings', userId],
    queryFn: async () => {
      let query = supabase
        .from('employee_trainings')
        .select('*, training:trainings(*)');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeTraining[];
    },
  });
}

export function useDocuments(type?: DocumentType) {
  return useQuery({
    queryKey: ['documents', type],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_active', true);
      
      if (type) {
        query = query.eq('document_type', type);
      }
      
      const { data, error } = await query.order('version', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useRIOHS() {
  return useQuery({
    queryKey: ['riohs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_type', 'riohs')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Document | null;
    },
  });
}

export function useDocumentAcknowledgements(documentId?: string) {
  return useQuery({
    queryKey: ['document-acknowledgements', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from('document_acknowledgements')
        .select('*')
        .eq('document_id', documentId);
      if (error) throw error;
      return data as DocumentAcknowledgement[];
    },
    enabled: !!documentId,
  });
}

export function useAcknowledgeDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data, error } = await supabase
        .from('document_acknowledgements')
        .insert({
          document_id: documentId,
          user_id: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['document-acknowledgements', documentId] });
      toast.success('Documento firmado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al firmar: ' + error.message);
    },
  });
}

export function useInspections() {
  return useQuery({
    queryKey: ['inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('planned_date', { ascending: false });
      if (error) throw error;
      return data as Inspection[];
    },
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inspection: Omit<Inspection, 'id' | 'created_at' | 'updated_at' | 'inspector_id'>) => {
      const { data, error } = await supabase
        .from('inspections')
        .insert({
          ...inspection,
          inspector_id: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['prevention-kpis'] });
      toast.success('Inspección creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear inspección: ' + error.message);
    },
  });
}

export function useAlerts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      
      // Filter out dismissed alerts
      return (data as Alert[]).filter(
        alert => !alert.dismissed_by?.includes(user?.id || '')
      );
    },
  });
}

export function useCorrectiveActions() {
  return useQuery({
    queryKey: ['corrective-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corrective_actions')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as CorrectiveAction[];
    },
  });
}

export function usePreventionKPIs() {
  return useQuery({
    queryKey: ['prevention-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calculate_prevention_kpis');
      if (error) throw error;
      return data as unknown as PreventionKPIs;
    },
  });
}

// Utility to get risk matrix data
export function useRiskMatrix() {
  const { data: risks } = useRisks();
  
  const matrixData = risks?.reduce((acc, risk) => {
    const key = `${risk.probability}-${risk.severity}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  return matrixData;
}

// Upload document to storage
export async function uploadDocument(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

export function useUploadRIOHS() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      version, 
      expiryDate, 
      registeredWithDT 
    }: { 
      file: File; 
      version: number; 
      expiryDate?: string; 
      registeredWithDT?: boolean;
    }) => {
      // Upload file
      const path = `riohs/v${version}-${Date.now()}.pdf`;
      const fileUrl = await uploadDocument(file, path);
      
      // Deactivate old versions
      await supabase
        .from('documents')
        .update({ is_active: false })
        .eq('document_type', 'riohs');
      
      // Create new document
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: `Reglamento Interno (RIOHS) v${version}`,
          document_type: 'riohs',
          file_url: fileUrl,
          version,
          expiry_date: expiryDate,
          registered_with_dt: registeredWithDT,
          uploaded_by: user?.id,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riohs'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('RIOHS subido exitosamente');
    },
    onError: (error) => {
      toast.error('Error al subir RIOHS: ' + error.message);
    },
  });
}
