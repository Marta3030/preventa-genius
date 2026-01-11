import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommitteeMember {
  id: string;
  employee_id: string | null;
  user_id: string | null;
  name: string;
  role: string;
  representation: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMeeting {
  id: string;
  title: string;
  meeting_date: string;
  location: string | null;
  agenda: string | null;
  attendees: string[] | null;
  minutes_doc_id: string | null;
  status: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MinutesAction {
  id: string;
  meeting_id: string;
  description: string;
  owner_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  status: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Committee Members
export function useCommitteeMembers() {
  return useQuery({
    queryKey: ['committee_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('committee_members')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as CommitteeMember[];
    }
  });
}

export function useCreateCommitteeMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (member: Omit<CommitteeMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('committee_members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee_members'] });
    }
  });
}

export function useUpdateCommitteeMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommitteeMember> & { id: string }) => {
      const { data, error } = await supabase
        .from('committee_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee_members'] });
    }
  });
}

// Committee Meetings
export function useCommitteeMeetings() {
  return useQuery({
    queryKey: ['committee_meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('committee_meetings')
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (error) throw error;
      return data as CommitteeMeeting[];
    }
  });
}

export function useCreateCommitteeMeeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meeting: Omit<CommitteeMeeting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('committee_meetings')
        .insert(meeting)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee_meetings'] });
    }
  });
}

export function useUpdateCommitteeMeeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommitteeMeeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('committee_meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee_meetings'] });
    }
  });
}

// Minutes Actions
export function useMinutesActions(meetingId?: string) {
  return useQuery({
    queryKey: ['minutes_actions', meetingId],
    queryFn: async () => {
      let query = supabase
        .from('minutes_actions')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MinutesAction[];
    }
  });
}

export function useCreateMinutesAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: Omit<MinutesAction, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('minutes_actions')
        .insert(action)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes_actions'] });
    }
  });
}

export function useUpdateMinutesAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MinutesAction> & { id: string }) => {
      const updateData = { ...updates };
      if (updates.status === 'completed') {
        (updateData as any).completed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('minutes_actions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes_actions'] });
    }
  });
}

// Stats
export function useComiteStats() {
  return useQuery({
    queryKey: ['comite_stats'],
    queryFn: async () => {
      const [membersRes, meetingsRes, actionsRes] = await Promise.all([
        supabase.from('committee_members').select('status'),
        supabase.from('committee_meetings').select('status, meeting_date'),
        supabase.from('minutes_actions').select('status')
      ]);
      
      if (membersRes.error) throw membersRes.error;
      if (meetingsRes.error) throw meetingsRes.error;
      if (actionsRes.error) throw actionsRes.error;
      
      const activeMembers = membersRes.data?.filter(m => m.status === 'active').length || 0;
      const completedMeetings = meetingsRes.data?.filter(m => m.status === 'completed').length || 0;
      const pendingActions = actionsRes.data?.filter(a => a.status === 'pending').length || 0;
      const completedActions = actionsRes.data?.filter(a => a.status === 'completed').length || 0;
      
      // Next meeting
      const upcomingMeetings = meetingsRes.data?.filter(m => 
        m.status === 'scheduled' && new Date(m.meeting_date) > new Date()
      ).sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime());
      
      return {
        activeMembers,
        completedMeetings,
        totalMeetings: meetingsRes.data?.length || 0,
        pendingActions,
        completedActions,
        nextMeeting: upcomingMeetings?.[0]?.meeting_date
      };
    }
  });
}
