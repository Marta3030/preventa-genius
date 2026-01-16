import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Shield,
  Users,
  UserPlus,
  HardHat,
  Wrench,
  Users2,
} from "lucide-react";

interface AreaStatus {
  name: string;
  icon: React.ElementType;
  compliance: number;
  status: "success" | "warning" | "danger";
  openItems: number;
}

const areas: AreaStatus[] = [
  { name: "Gerencia", icon: Shield, compliance: 95, status: "success", openItems: 2 },
  { name: "RRHH", icon: Users, compliance: 88, status: "success", openItems: 5 },
  { name: "Reclutamiento", icon: UserPlus, compliance: 75, status: "warning", openItems: 8 },
  { name: "Prevención", icon: HardHat, compliance: 82, status: "success", openItems: 12 },
  { name: "Operaciones", icon: Wrench, compliance: 68, status: "warning", openItems: 15 },
  { name: "Comité", icon: Users2, compliance: 55, status: "danger", openItems: 4 },
];

const statusConfig = {
  success: {
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    dot: "bg-success",
    label: "Óptimo",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    dot: "bg-warning",
    label: "Atención",
  },
  danger: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    dot: "bg-destructive",
    label: "Crítico",
  },
};

export function AreaStatusGrid() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Semáforo por Área</CardTitle>
        <CardDescription>
          Estado de cumplimiento por módulo
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Leyenda */}
        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", config.dot)} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Grid de áreas */}
        <div className="space-y-2">
          {areas.map((area, index) => {
            const Icon = area.icon;
            const config = statusConfig[area.status];

            return (
              <div
                key={area.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer",
                  config.bg,
                  config.border
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Lado izquierdo: Icono y nombre */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("p-1.5 rounded-md bg-background/50")}>
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {area.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {area.openItems} pendientes
                    </p>
                  </div>
                </div>

                {/* Lado derecho: Porcentaje y estado */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", config.dot)} />
                    <span className={cn("text-lg font-bold tabular-nums", config.text)}>
                      {area.compliance}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen al pie */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Promedio general:</span>
            <span className="font-semibold text-foreground">
              {Math.round(areas.reduce((acc, a) => acc + a.compliance, 0) / areas.length)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}