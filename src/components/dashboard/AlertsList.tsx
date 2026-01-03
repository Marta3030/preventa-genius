import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, FileWarning, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  module: string;
  icon: React.ElementType;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Accidente reportado",
    description: "Incidente con lesión en área de producción",
    timestamp: "Hace 2 horas",
    module: "Prevención",
    icon: ShieldAlert,
  },
  {
    id: "2",
    type: "warning",
    title: "RIOHS por vencer",
    description: "Documento vence en 15 días - Renovar",
    timestamp: "Hace 5 horas",
    module: "Prevención",
    icon: FileWarning,
  },
  {
    id: "3",
    type: "warning",
    title: "Capacitación pendiente",
    description: "5 trabajadores sin inducción SST",
    timestamp: "Hace 1 día",
    module: "RRHH",
    icon: Users,
  },
  {
    id: "4",
    type: "info",
    title: "Reunión Comité",
    description: "Comité Paritario agendado para mañana",
    timestamp: "Hace 2 días",
    module: "Comité",
    icon: Clock,
  },
];

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

export function AlertsList() {
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
              {mockAlerts.filter((a) => a.type === "critical").length} críticas
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert, index) => {
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
