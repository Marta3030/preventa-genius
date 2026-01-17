import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DocumentType = Database['public']['Enums']['document_type'];

// Types
export interface Document {
  id: string;
  title: string;
  document_type: DocumentType;
  file_url: string;
  version: number;
  is_active: boolean;
  expiry_date?: string;
  effective_date?: string;
  registered_with_dt?: boolean;
  file_hash?: string;
  notify_all?: boolean;
  owner_area?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_url: string;
  file_hash?: string;
  status: string;
  uploaded_by: string;
  notes?: string;
  created_at: string;
}

export interface PendingSignature {
  id: string;
  document_id: string;
  employee_id: string;
  requested_at: string;
  requested_by: string;
  signed_at?: string;
  signature_method?: string;
  signer_ip?: string;
  reminder_sent_at?: string;
  status: string;
  created_at: string;
  employee?: {
    id: string;
    name: string;
    rut: string;
    area: string;
    position: string;
  };
}

export interface DTRegistrationTask {
  id: string;
  document_id: string;
  created_by: string;
  status: string;
  export_package_url?: string;
  submitted_at?: string;
  confirmed_at?: string;
  dt_folio?: string;
  notes?: string;
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

// Utility to generate SHA256 hash
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Upload document to storage
async function uploadDocumentFile(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

// === Document Queries ===
export function useAllDocuments() {
  return useQuery({
    queryKey: ['all-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useActiveDocuments(type?: DocumentType) {
  return useQuery({
    queryKey: ['active-documents', type],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_active', true);
      
      if (type) {
        query = query.eq('document_type', type);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useDocument(documentId?: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      if (error) throw error;
      return data as Document;
    },
    enabled: !!documentId,
  });
}

export function useDocumentVersions(documentId?: string) {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      
      // Get all documents with same title pattern to get version history
      const { data: doc } = await supabase
        .from('documents')
        .select('document_type')
        .eq('id', documentId)
        .single();
      
      if (!doc) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('document_type', doc.document_type)
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!documentId,
  });
}

// === Signature Queries ===
export function usePendingSignatures(documentId?: string) {
  return useQuery({
    queryKey: ['pending-signatures', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      
      const { data, error } = await supabase
        .from('pending_signatures')
        .select(`
          *,
          employee:employees(id, name, rut, area, position)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PendingSignature[];
    },
    enabled: !!documentId,
  });
}

export function useMyPendingSignatures() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-pending-signatures', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get employee id for current user
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!employee) return [];
      
      const { data, error } = await supabase
        .from('pending_signatures')
        .select(`
          *,
          document:documents(id, title, document_type, file_url, version)
        `)
        .eq('employee_id', employee.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
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

// === DT Registration Queries ===
export function useDTRegistrationTasks(documentId?: string) {
  return useQuery({
    queryKey: ['dt-registration-tasks', documentId],
    queryFn: async () => {
      let query = supabase
        .from('dt_registration_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DTRegistrationTask[];
    },
  });
}

// === Document Mutations ===
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      title,
      documentType,
      version,
      expiryDate,
      effectiveDate,
      registeredWithDT,
      notifyAll,
      ownerArea,
    }: { 
      file: File; 
      title: string;
      documentType: DocumentType;
      version: number;
      expiryDate?: string;
      effectiveDate?: string;
      registeredWithDT?: boolean;
      notifyAll?: boolean;
      ownerArea?: string;
    }) => {
      // Generate file hash
      const fileHash = await generateFileHash(file);
      
      // Upload file
      const path = `${documentType}/v${version}-${Date.now()}.pdf`;
      const fileUrl = await uploadDocumentFile(file, path);
      
      // Deactivate old versions of same type if needed
      if (documentType === 'riohs') {
        await supabase
          .from('documents')
          .update({ is_active: false })
          .eq('document_type', documentType);
      }
      
      // Create new document
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          document_type: documentType,
          file_url: fileUrl,
          version,
          file_hash: fileHash,
          expiry_date: expiryDate,
          effective_date: effectiveDate,
          registered_with_dt: registeredWithDT,
          notify_all: notifyAll,
          owner_area: ownerArea,
          uploaded_by: user?.id,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-documents'] });
      queryClient.invalidateQueries({ queryKey: ['active-documents'] });
      queryClient.invalidateQueries({ queryKey: ['riohs'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`Documento "${data.title}" subido exitosamente`);
    },
    onError: (error) => {
      toast.error('Error al subir documento: ' + error.message);
    },
  });
}

export function useCreateSignatureCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      documentId,
      employeeIds,
      allEmployees,
      byArea,
    }: { 
      documentId: string;
      employeeIds?: string[];
      allEmployees?: boolean;
      byArea?: Database['public']['Enums']['area_type'];
    }) => {
      let targetEmployees: string[] = [];
      
      if (allEmployees) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .eq('status', 'active');
        targetEmployees = employees?.map(e => e.id) || [];
      } else if (byArea) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .eq('area', byArea)
          .eq('status', 'active');
        targetEmployees = employees?.map(e => e.id) || [];
      } else if (employeeIds) {
        targetEmployees = employeeIds;
      }
      
      // Create pending signatures for each employee
      const signatures = targetEmployees.map(employeeId => ({
        document_id: documentId,
        employee_id: employeeId,
        requested_by: user?.id,
        status: 'pending',
      }));
      
      const { data, error } = await supabase
        .from('pending_signatures')
        .upsert(signatures, { onConflict: 'document_id,employee_id' })
        .select();
      
      if (error) throw error;
      
      // Update document to mark notify_all
      await supabase
        .from('documents')
        .update({ notify_all: allEmployees })
        .eq('id', documentId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-signatures'] });
      toast.success('Campaña de firmas creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear campaña: ' + error.message);
    },
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      signatureId,
      documentId,
    }: { 
      signatureId: string;
      documentId: string;
    }) => {
      // Update pending signature
      const { error: sigError } = await supabase
        .from('pending_signatures')
        .update({
          signed_at: new Date().toISOString(),
          signature_method: 'in_app',
          status: 'signed',
        })
        .eq('id', signatureId);
      
      if (sigError) throw sigError;
      
      // Also create acknowledgement record
      const { error: ackError } = await supabase
        .from('document_acknowledgements')
        .insert({
          document_id: documentId,
          user_id: user?.id,
        });
      
      if (ackError && !ackError.message.includes('duplicate')) {
        throw ackError;
      }
      
      return signatureId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-signatures'] });
      queryClient.invalidateQueries({ queryKey: ['document-acknowledgements'] });
      toast.success('Documento firmado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al firmar: ' + error.message);
    },
  });
}

export function useCreateDTRegistration() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      documentId,
      notes,
    }: { 
      documentId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('dt_registration_tasks')
        .insert({
          document_id: documentId,
          created_by: user?.id,
          status: 'pending',
          notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as DTRegistrationTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dt-registration-tasks'] });
      toast.success('Tarea de registro DT creada');
    },
    onError: (error) => {
      toast.error('Error al crear tarea: ' + error.message);
    },
  });
}

export function useUpdateDTRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id,
      status,
      dt_folio,
      submitted_at,
      confirmed_at,
      notes,
    }: { 
      id: string;
      status?: string;
      dt_folio?: string;
      submitted_at?: string;
      confirmed_at?: string;
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (dt_folio) updates.dt_folio = dt_folio;
      if (submitted_at) updates.submitted_at = submitted_at;
      if (confirmed_at) updates.confirmed_at = confirmed_at;
      if (notes !== undefined) updates.notes = notes;
      
      const { data, error } = await supabase
        .from('dt_registration_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update document registered_with_dt flag
      if (status === 'confirmed') {
        const task = data as DTRegistrationTask;
        await supabase
          .from('documents')
          .update({ registered_with_dt: true })
          .eq('id', task.document_id);
      }
      
      return data as DTRegistrationTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dt-registration-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-documents'] });
      queryClient.invalidateQueries({ queryKey: ['active-documents'] });
      toast.success('Registro DT actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

// === Delete Document ===
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      // First delete related records
      await supabase
        .from('pending_signatures')
        .delete()
        .eq('document_id', documentId);
      
      await supabase
        .from('document_acknowledgements')
        .delete()
        .eq('document_id', documentId);
      
      await supabase
        .from('dt_registration_tasks')
        .delete()
        .eq('document_id', documentId);
      
      // Then delete the document
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-documents'] });
      queryClient.invalidateQueries({ queryKey: ['active-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['riohs'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar documento: ' + error.message);
    },
  });
}

// === Document Statistics ===
export function useDocumentStats() {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const [
        { count: totalDocs },
        { count: activeDocs },
        { data: pendingSigs },
        { data: dtTasks },
      ] = await Promise.all([
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('pending_signatures').select('status').eq('status', 'pending'),
        supabase.from('dt_registration_tasks').select('status').eq('status', 'pending'),
      ]);
      
      return {
        totalDocuments: totalDocs || 0,
        activeDocuments: activeDocs || 0,
        pendingSignatures: pendingSigs?.length || 0,
        pendingDTRegistrations: dtTasks?.length || 0,
      };
    },
  });
}

// === Export Functions ===
export async function generateDTExportPackage(documentId: string): Promise<{
  documentData: Document;
  signatures: PendingSignature[];
  metadata: Record<string, unknown>;
}> {
  // Get document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();
  
  if (docError) throw docError;
  
  // Get all signatures
  const { data: signatures, error: sigError } = await supabase
    .from('pending_signatures')
    .select(`
      *,
      employee:employees(id, name, rut, area, position)
    `)
    .eq('document_id', documentId)
    .eq('status', 'signed');
  
  if (sigError) throw sigError;
  
  // Build metadata
  const metadata = {
    document_title: doc.title,
    document_type: doc.document_type,
    version: doc.version,
    file_hash: doc.file_hash,
    effective_date: doc.effective_date,
    expiry_date: doc.expiry_date,
    total_signatures: signatures?.length || 0,
    export_date: new Date().toISOString(),
  };
  
  return {
    documentData: doc as Document,
    signatures: signatures as PendingSignature[],
    metadata,
  };
}
