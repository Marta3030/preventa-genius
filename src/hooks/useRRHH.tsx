import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, Enums } from '@/integrations/supabase/types';

type AreaType = Enums<'area_type'>;

// Types
export interface Employee {
  id: string;
  name: string;
  rut: string;
  position: string;
  area: AreaType;
  status: string;
  date_joined: string;
  user_id: string | null;
  company_id: string | null;
  blocked_for_tasks: boolean;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  salary: number | null;
  document_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingTask {
  id: string;
  employee_id: string;
  task_name: string;
  task_type: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface EmployeeHealth {
  id: string;
  employee_id: string;
  exam_type: string;
  exam_date: string;
  next_exam_date: string | null;
  result: string | null;
  notes: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithDetails extends Employee {
  contracts?: Contract[];
  onboarding_tasks?: OnboardingTask[];
  health_records?: EmployeeHealth[];
}

// Employees Queries
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

// Contracts Queries
export function useContracts(employeeId?: string) {
  return useQuery({
    queryKey: ['contracts', employeeId],
    queryFn: async () => {
      let query = supabase.from('contracts').select('*');
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Contract[];
    },
  });
}

// Onboarding Tasks Queries
export function useOnboardingTasks(employeeId?: string) {
  return useQuery({
    queryKey: ['onboarding_tasks', employeeId],
    queryFn: async () => {
      let query = supabase.from('onboarding_tasks').select('*');
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      const { data, error } = await query.order('due_date');
      if (error) throw error;
      return data as OnboardingTask[];
    },
  });
}

// Employee Health Queries
export function useEmployeeHealth(employeeId?: string) {
  return useQuery({
    queryKey: ['employee_health', employeeId],
    queryFn: async () => {
      let query = supabase.from('employee_health').select('*');
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      const { data, error } = await query.order('exam_date', { ascending: false });
      if (error) throw error;
      return data as EmployeeHealth[];
    },
  });
}

// Mutations
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employee: {
      name: string;
      rut: string;
      position: string;
      area: AreaType;
      date_joined?: string;
      user_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: employee.name,
          rut: employee.rut,
          position: employee.position,
          area: employee.area,
          date_joined: employee.date_joined || new Date().toISOString().split('T')[0],
          user_id: employee.user_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding_tasks'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contract: {
      employee_id: string;
      contract_type: string;
      start_date: string;
      end_date?: string | null;
      salary?: number | null;
    }) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contract)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.employee_id] });
    },
  });
}

export function useUpdateOnboardingTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      if (notes) {
        updates.notes = notes;
      }
      
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding_tasks'] });
    },
  });
}

export function useCreateHealthRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: {
      employee_id: string;
      exam_type: string;
      exam_date: string;
      next_exam_date?: string | null;
      result?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('employee_health')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee_health'] });
      queryClient.invalidateQueries({ queryKey: ['employee_health', variables.employee_id] });
      // Also invalidate employees since the trigger might have blocked an employee
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employee_id] });
    },
  });
}

// Unblock employee mutation
export function useUnblockEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase
        .rpc('unblock_employee', { p_employee_id: employeeId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// Stats for dashboard
export function useRRHHStats() {
  return useQuery({
    queryKey: ['rrhh_stats'],
    queryFn: async () => {
      const [employeesRes, onboardingRes, contractsRes] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
        supabase.from('onboarding_tasks').select('id, status', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('contracts').select('id, end_date').not('end_date', 'is', null),
      ]);

      const activeEmployees = employeesRes.data?.filter(e => e.status === 'active').length || 0;
      const pendingOnboarding = onboardingRes.count || 0;
      
      // Contracts expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringContracts = contractsRes.data?.filter(c => 
        c.end_date && new Date(c.end_date) <= thirtyDaysFromNow
      ).length || 0;

      return {
        activeEmployees,
        pendingOnboarding,
        expiringContracts,
      };
    },
  });
}
