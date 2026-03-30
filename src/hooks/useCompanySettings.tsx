import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCompanySettings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company-settings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      
      const settings: Record<string, string> = {};
      data?.forEach(s => {
        settings[s.setting_key] = s.setting_value || '';
      });
      return settings;
    },
  });
}

export function useSaveCompanySetting() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('setting_key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('company_settings')
          .update({ setting_value: value })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            setting_key: key,
            setting_value: value,
            is_encrypted: key.includes('api_key'),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });
}
