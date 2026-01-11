import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ManagementAction {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  document_id: string | null;
  action_type: string;
  created_by: string;
  created_at: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  due_date: string | null;
  notes: string | null;
  updated_at: string;
}

export function useManagementActions() {
  return useQuery({
    queryKey: ['management_actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('management_actions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ManagementAction[];
    }
  });
}

export function useCreateManagementAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: Omit<ManagementAction, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at' | 'rejected_reason'>) => {
      const { data, error } = await supabase
        .from('management_actions')
        .insert(action)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management_actions'] });
    }
  });
}

export function useApproveManagementAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, approved_by, notes }: { id: string; approved_by: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('management_actions')
        .update({
          status: 'approved',
          approved_by,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management_actions'] });
    }
  });
}

export function useRejectManagementAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, rejected_reason }: { id: string; rejected_reason: string }) => {
      const { data, error } = await supabase
        .from('management_actions')
        .update({
          status: 'rejected',
          rejected_reason
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management_actions'] });
    }
  });
}

export function useGerenciaStats() {
  return useQuery({
    queryKey: ['gerencia_stats'],
    queryFn: async () => {
      const { data: actions, error } = await supabase
        .from('management_actions')
        .select('status, created_at, approved_at');
      
      if (error) throw error;
      
      const pending = actions?.filter(a => a.status === 'pending').length || 0;
      const approved = actions?.filter(a => a.status === 'approved').length || 0;
      const rejected = actions?.filter(a => a.status === 'rejected').length || 0;
      
      // Calculate average approval time
      const approvedActions = actions?.filter(a => a.status === 'approved' && a.approved_at);
      let avgApprovalDays = 0;
      if (approvedActions && approvedActions.length > 0) {
        const totalDays = approvedActions.reduce((sum, a) => {
          const created = new Date(a.created_at);
          const approved = new Date(a.approved_at!);
          return sum + (approved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgApprovalDays = Math.round(totalDays / approvedActions.length);
      }
      
      return {
        pending,
        approved,
        rejected,
        total: actions?.length || 0,
        avgApprovalDays
      };
    }
  });
}
