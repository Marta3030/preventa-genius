import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, FileWarning, Users, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useIncidents } from "@/hooks/usePrevention";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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
      return 'critical';
    case 'moderado':
      return 'warning';
    default:
      return 'info';
  }
};

export function AlertsList() {
  const { data: dbAlerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: incidents, isLoading: isLoadingIncidents } = useIncidents();

  // Generate alerts from incidents
  const incidentAlerts: AlertItem[] = (incidents || [])
    .filter(i => i.investigation_status !== 'cerrado')
    .slice(0, 5)
    .map(incident => ({
      id: incident.id,
      type: severityToType(incident.severity),
      title: incident.title,
      description: `${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} - ${incident.area}`,
      timestamp: formatDistanceToNow(parseISO(incident.incident_date), { addSuffix: true, locale: es }),
      module: "Prevención",
      icon: incident.severity === 'grave' || incident.severity === 'catastrofico' ? ShieldAlert : AlertTriangle,
    }));

  // Combine with system alerts
  const systemAlerts: AlertItem[] = (dbAlerts || []).map(alert => ({
    id: alert.id,
    type: alert.severity === 'critical' || alert.severity === 'error' ? 'critical' : 
          alert.severity === 'warning' ? 'warning' : 'info',
    title: alert.title,
    description: alert.message,
    timestamp: formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true, locale: es }),
    module: "Sistema",
    icon: AlertTriangle,
  }));

  const alerts = [...incidentAlerts, ...systemAlerts].slice(0, 5);

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
            <AlertTriangle className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alertas Prioritarias</h3>
            <p className="text-sm text-muted-foreground">Sin alertas</p>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No hay alertas activas en este momento</p>
          <p className="text-xs mt-1">El sistema notificará incidentes y vencimientos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Alertas Prioritarias</h3>
            <p className="text-sm text-muted-foreground">
              {alerts.filter((a) => a.type === "critical").length} críticas
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          const styles = typeStyles[alert.type];

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer",
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
                      "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase",
                      styles.badge
                    )}
                  >
                    {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Alerta" : "Info"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {alert.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {alert.module}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
