import { cn } from "@/lib/utils";
import { AlertTriangle, FileWarning, ShieldAlert, Heart, Stethoscope, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useIncidents, useDismissAlert } from "@/hooks/usePrevention";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface AlertItem {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  module: string;
  icon: React.ElementType;
}

const typeStyles = {
  critical: {
    bg: "bg-destructive/5 border-destructive/20",
    icon: "bg-destructive/10 text-destructive",
    badge: "bg-destructive text-destructive-foreground",
  },
  warning: {
    bg: "bg-warning/5 border-warning/20",
    icon: "bg-warning/10 text-warning",
    badge: "bg-warning text-warning-foreground",
  },
  info: {
    bg: "bg-info/5 border-info/20",
    icon: "bg-info/10 text-info",
    badge: "bg-info text-info-foreground",
  },
};

const severityToType = (severity: string): "critical" | "warning" | "info" => {
  switch (severity) {
    case 'catastrofico':
    case 'grave':
    case 'critical':
    case 'error':
      return 'critical';
    case 'moderado':
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
};

const getAlertIcon = (entityType?: string, severity?: string): React.ElementType => {
  if (entityType === 'employee_health') {
    return severity === 'critical' || severity === 'error' ? Heart : Stethoscope;
  }
  if (severity === 'critical' || severity === 'error') {
    return ShieldAlert;
  }
  if (entityType === 'contract' || entityType === 'onboarding') {
    return FileWarning;
  }
  return AlertTriangle;
};

const getModuleName = (entityType?: string): string => {
  switch (entityType) {
    case 'employee_health':
      return 'Salud Ocupacional';
    case 'incident':
      return 'Prevención';
    case 'contract':
      return 'RRHH';
    case 'onboarding':
      return 'Onboarding';
    default:
      return 'Sistema';
  }
};

export function AlertsList() {
  const { data: dbAlerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: incidents, isLoading: isLoadingIncidents } = useIncidents();
  const dismissAlert = useDismissAlert();

  const handleDismiss = (alertId: string, isSystemAlert: boolean) => {
    if (isSystemAlert) {
      dismissAlert.mutate(alertId);
    } else {
      toast.info('Los incidentes se cierran desde el módulo de Prevención');
    }
  };

  // Generate alerts from open incidents
  const incidentAlerts: AlertItem[] = (incidents || [])
    .filter(i => i.investigation_status !== 'cerrado')
    .slice(0, 3)
    .map(incident => ({
      id: `incident-${incident.id}`,
      type: severityToType(incident.severity),
      title: incident.title,
      description: `${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} - ${incident.area}`,
      timestamp: formatDistanceToNow(parseISO(incident.incident_date), { addSuffix: true, locale: es }),
      module: "Prevención",
      icon: incident.severity === 'grave' || incident.severity === 'catastrofico' ? ShieldAlert : AlertTriangle,
    }));

  // System alerts from database (including health alerts)
  const systemAlerts: AlertItem[] = (dbAlerts || []).map(alert => ({
    id: alert.id,
    type: severityToType(alert.severity),
    title: alert.title,
    description: alert.message,
    timestamp: formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true, locale: es }),
    module: getModuleName(alert.entity_type),
    icon: getAlertIcon(alert.entity_type, alert.severity),
  }));

  // Combine and prioritize: system alerts first (health, etc.), then incidents
  const alerts = [...systemAlerts, ...incidentAlerts].slice(0, 6);

  // Loading skeleton
  if (isLoadingAlerts || isLoadingIncidents) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // No alerts
  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alertas Prioritarias</h3>
            <p className="text-sm text-muted-foreground">Sin alertas</p>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No hay alertas activas en este momento</p>
          <p className="text-xs mt-1">El sistema notificará incidentes y vencimientos de salud</p>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            criticalCount > 0 ? "bg-destructive/10" : "bg-warning/10"
          )}>
            <AlertTriangle className={cn(
              "h-5 w-5",
              criticalCount > 0 ? "text-destructive" : "text-warning"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alertas Prioritarias</h3>
            <p className="text-sm text-muted-foreground">
              {criticalCount > 0 && `${criticalCount} críticas`}
              {criticalCount > 0 && warningCount > 0 && ' • '}
              {warningCount > 0 && `${warningCount} alertas`}
              {criticalCount === 0 && warningCount === 0 && `${alerts.length} informativas`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          const styles = typeStyles[alert.type];
          const isSystemAlert = !alert.id.startsWith('incident-');

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm group",
                styles.bg
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("p-2 rounded-lg flex-shrink-0", styles.icon)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {alert.title}
                  </h4>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase flex-shrink-0",
                      styles.badge
                    )}
                  >
                    {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Alerta" : "Info"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {alert.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {alert.module}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(alert.id, isSystemAlert);
                }}
                disabled={dismissAlert.isPending}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}