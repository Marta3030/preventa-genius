import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runAlertScan, getAlertStats, createAlert, AlertSeverity } from '@/services/alertEngine';
import { toast } from 'sonner';

/**
 * Hook to get alert statistics
 */
export function useAlertStats() {
  return useQuery({
    queryKey: ['alert-stats'],
    queryFn: getAlertStats,
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook to manually trigger an alert scan
 */
export function useRunAlertScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runAlertScan,
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      
      toast.success(
        `Escaneo completado: ${results.trainingsChecked} capacitaciones, ${results.actionsChecked} acciones, ${results.contractsChecked} contratos revisados`
      );
    },
    onError: (error) => {
      toast.error(`Error en escaneo: ${error.message}`);
    },
  });
}

/**
 * Hook to create a manual alert
 */
export function useCreateManualAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      title: string;
      message: string;
      severity: AlertSeverity;
      entityType?: string;
    }) => {
      return createAlert({
        title: config.title,
        message: config.message,
        severity: config.severity,
        entityType: (config.entityType || 'system') as 'system',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      toast.success('Alerta creada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al crear alerta: ${error.message}`);
    },
  });
}
