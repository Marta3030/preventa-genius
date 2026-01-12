import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hireCandidate } from '@/services/hiringService';

export interface Vacancy {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  area: string;
  requirements: string | null;
  salary_range: string | null;
  positions_count: number;
  published_at: string | null;
  closes_at: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  vacancy_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  rut: string | null;
  cv_url: string | null;
  cover_letter: string | null;
  status: string;
  score: number | null;
  notes: string | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateWithVacancy extends Candidate {
  vacancies?: { title: string } | null;
}

export interface PipelineEntry {
  id: string;
  candidate_id: string;
  stage: string;
  moved_at: string;
  moved_by: string;
  notes: string | null;
  evaluation_score: number | null;
  created_at: string;
}

// Vacancies
export function useVacancies() {
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Vacancy[];
    }
  });
}

export function useCreateVacancy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vacancy: Omit<Vacancy, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vacancies')
        .insert(vacancy)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    }
  });
}

export function useUpdateVacancy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vacancy> & { id: string }) => {
      const { data, error } = await supabase
        .from('vacancies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    }
  });
}

// Candidates
export function useCandidates(vacancyId?: string) {
  return useQuery({
    queryKey: ['candidates', vacancyId],
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select('*, vacancies(title)')
        .order('applied_at', { ascending: false });
      
      if (vacancyId) {
        query = query.eq('vacancy_id', vacancyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CandidateWithVacancy[];
    }
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at' | 'applied_at'>) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Candidate> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });
}

// Pipeline
export function usePipeline(candidateId?: string) {
  return useQuery({
    queryKey: ['pipeline', candidateId],
    queryFn: async () => {
      let query = supabase
        .from('recruitment_pipeline')
        .select('*')
        .order('moved_at', { ascending: false });
      
      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PipelineEntry[];
    }
  });
}

export function useAdvanceCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ candidateId, stage, notes, score, movedBy }: {
      candidateId: string;
      stage: string;
      notes?: string;
      score?: number;
      movedBy: string;
    }) => {
      // Create pipeline entry
      const { error: pipelineError } = await supabase
        .from('recruitment_pipeline')
        .insert({
          candidate_id: candidateId,
          stage,
          notes,
          evaluation_score: score,
          moved_by: movedBy
        });
      
      if (pipelineError) throw pipelineError;
      
      // Update candidate status
      const { data, error: candidateError } = await supabase
        .from('candidates')
        .update({ status: stage })
        .eq('id', candidateId)
        .select()
        .single();
      
      if (candidateError) throw candidateError;

      // If hired, execute the full hiring workflow
      if (stage === 'hired') {
        const hiringResult = await hireCandidate(candidateId);
        
        if (hiringResult.success) {
          toast.success(
            `¡Contratación exitosa! Se creó el empleado, ${hiringResult.onboardingTasksCreated} tareas de onboarding y ${hiringResult.trainingsAssigned} capacitaciones asignadas.`
          );
        } else {
          // Partial success - candidate marked as hired but some workflow steps failed
          toast.warning(
            `Candidato marcado como contratado, pero hubo errores: ${hiringResult.errors.join(', ')}`
          );
        }
        
        // Invalidate RRHH and Prevention caches
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding_tasks'] });
        queryClient.invalidateQueries({ queryKey: ['contracts'] });
        queryClient.invalidateQueries({ queryKey: ['employee-trainings'] });
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['rrhh_stats'] });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['reclutamiento_stats'] });
    }
  });
}

// Stats
export function useReclutamientoStats() {
  return useQuery({
    queryKey: ['reclutamiento_stats'],
    queryFn: async () => {
      const [vacanciesRes, candidatesRes] = await Promise.all([
        supabase.from('vacancies').select('status'),
        supabase.from('candidates').select('status, applied_at')
      ]);
      
      if (vacanciesRes.error) throw vacanciesRes.error;
      if (candidatesRes.error) throw candidatesRes.error;
      
      const activeVacancies = vacanciesRes.data?.filter(v => v.status === 'published').length || 0;
      const totalCandidates = candidatesRes.data?.length || 0;
      const hired = candidatesRes.data?.filter(c => c.status === 'hired').length || 0;
      const inProcess = candidatesRes.data?.filter(c => !['hired', 'rejected'].includes(c.status)).length || 0;
      
      return {
        activeVacancies,
        totalCandidates,
        hired,
        inProcess
      };
    }
  });
}
