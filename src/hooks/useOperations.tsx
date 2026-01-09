import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Enums } from '@/integrations/supabase/types';

type AreaType = Enums<'area_type'>;

export interface OperationalTask {
  id: string;
  title: string;
  description: string | null;
  area: AreaType;
  priority: string;
  status: string;
  risk_level: string | null;
  assigned_to: string | null;
  assigned_by: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalTaskWithEmployee extends OperationalTask {
  employee?: {
    id: string;
    name: string;
    blocked_for_tasks: boolean;
    blocked_reason: string | null;
  } | null;
}

// Fetch all operational tasks
export function useOperationalTasks(area?: AreaType) {
  return useQuery({
    queryKey: ['operational_tasks', area],
    queryFn: async () => {
      let query = supabase
        .from('operational_tasks')
        .select(`
          *,
          employee:employees!operational_tasks_assigned_to_fkey(
            id, name, blocked_for_tasks, blocked_reason
          )
        `)
        .order('created_at', { ascending: false });
      
      if (area) {
        query = query.eq('area', area);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OperationalTaskWithEmployee[];
    },
  });
}

// Create operational task
export function useCreateOperationalTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      area: AreaType;
      priority?: string;
      risk_level?: string;
      assigned_to?: string | null;
      due_date?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const { data, error } = await supabase
        .from('operational_tasks')
        .insert({
          ...task,
          assigned_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        // Handle blocked employee error
        if (error.message.includes('No se puede asignar')) {
          throw new Error(error.message);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operational_tasks'] });
    },
  });
}

// Update operational task
export function useUpdateOperationalTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperationalTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('operational_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Handle blocked employee error
        if (error.message.includes('No se puede asignar')) {
          throw new Error(error.message);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operational_tasks'] });
    },
  });
}

// Get available (non-blocked) employees for assignment
export function useAvailableEmployees() {
  return useQuery({
    queryKey: ['available_employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position, area, blocked_for_tasks, blocked_reason')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

// Stats for operations dashboard
export function useOperationsStats() {
  return useQuery({
    queryKey: ['operations_stats'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('operational_tasks')
        .select('id, status, priority, due_date');
      
      if (error) throw error;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pending = tasks?.filter(t => t.status === 'pending').length || 0;
      const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0;
      const completed = tasks?.filter(t => t.status === 'completed').length || 0;
      const overdue = tasks?.filter(t => 
        t.status !== 'completed' && 
        t.due_date && 
        new Date(t.due_date) < today
      ).length || 0;
      const highPriority = tasks?.filter(t => 
        t.status !== 'completed' && 
        t.priority === 'high'
      ).length || 0;
      
      return {
        pending,
        inProgress,
        completed,
        overdue,
        highPriority,
        total: tasks?.length || 0,
      };
    },
  });
}
