import { cn } from "@/lib/utils";
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

const statusColors = {
  success: {
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    dot: "bg-success",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    dot: "bg-warning",
  },
  danger: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    dot: "bg-destructive",
  },
};

export function AreaStatusGrid() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Semáforo por Área</h3>
        <p className="text-sm text-muted-foreground">
          Estado de cumplimiento por módulo
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {areas.map((area, index) => {
          const Icon = area.icon;
          const colors = statusColors[area.status];

          return (
            <div
              key={area.name}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                colors.bg,
                colors.border
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-foreground" />
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", colors.dot)} />
                  <span className={cn("text-lg font-bold", colors.text)}>
                    {area.compliance}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">{area.name}</p>
              <p className="text-xs text-muted-foreground">
                {area.openItems} items pendientes
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
