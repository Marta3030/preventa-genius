import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRisks } from "@/hooks/usePrevention";
import { RiskForm } from "@/components/prevention/RiskForm";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

const probabilityLabels = ["Muy Alta", "Alta", "Media", "Baja"];
const severityLabels = ["Leve", "Moderada", "Grave", "Catastrófica"];

function getRiskLevel(probability: number, severity: number): "low" | "medium" | "high" | "critical" {
  const score = probability * severity;
  if (score >= 12) return "critical";
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

const riskColors = {
  low: "bg-success hover:bg-success/80",
  medium: "bg-primary hover:bg-primary/80",
  high: "bg-warning hover:bg-warning/80",
  critical: "bg-destructive hover:bg-destructive/80",
};

const riskLabels = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export function RiskMatrix() {
  const { data: risks, isLoading } = useRisks();
  const { isAdmin } = useAuth();

  // Build matrix data from real risks
  const getRiskCount = (prob: number, sev: number): number => {
    if (!risks) return 0;
    return risks.filter(r => r.probability === prob && r.severity === sev).length;
  };

  const getRisksForCell = (prob: number, sev: number) => {
    if (!risks) return [];
    return risks.filter(r => r.probability === prob && r.severity === sev);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalRisks = risks?.length || 0;
  const criticalRisks = risks?.filter(r => r.residual_risk === 'critico' || r.residual_risk === 'alto').length || 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Matriz de Riesgos</h3>
          <p className="text-sm text-muted-foreground">
            IPER - {totalRisks} riesgos identificados • {criticalRisks} críticos/altos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {Object.entries(riskColors).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded", color.split(" ")[0])} />
                <span className="text-xs text-muted-foreground capitalize">
                  {riskLabels[level as keyof typeof riskLabels]}
                </span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <RiskForm 
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="flex">
        {/* Y-axis label */}
        <div className="flex items-center mr-2">
          <span className="text-xs font-medium text-muted-foreground -rotate-90 whitespace-nowrap">
            PROBABILIDAD
          </span>
        </div>

        <div className="flex-1">
          {/* Matrix grid */}
          <div className="grid grid-cols-5 gap-1">
            {/* Header row */}
            <div />
            {severityLabels.map((label) => (
              <div
                key={label}
                className="text-xs font-medium text-muted-foreground text-center py-1"
              >
                {label}
              </div>
            ))}

            {/* Data rows */}
            {probabilityLabels.map((probLabel, probIndex) => (
              <>
                <div
                  key={`label-${probLabel}`}
                  className="text-xs font-medium text-muted-foreground flex items-center pr-2"
                >
                  {probLabel}
                </div>
                {severityLabels.map((_, sevIndex) => {
                  const prob = probIndex + 1;
                  const sev = sevIndex + 1;
                  const count = getRiskCount(prob, sev);
                  const cellRisks = getRisksForCell(prob, sev);
                  const level = getRiskLevel(prob, sev);

                  return (
                    <Tooltip key={`${prob}-${sev}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "risk-cell aspect-square",
                            riskColors[level],
                            count > 0 ? "text-white" : "text-transparent"
                          )}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">
                          {count} riesgo{count !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {probLabel} probabilidad / {severityLabels[sevIndex]} severidad
                        </p>
                        <p className="text-xs mt-1">
                          Nivel: <span className="font-medium">{riskLabels[level]}</span>
                        </p>
                        {cellRisks.length > 0 && (
                          <ul className="text-xs mt-2 space-y-1">
                            {cellRisks.slice(0, 3).map(risk => (
                              <li key={risk.id} className="truncate">• {risk.title}</li>
                            ))}
                            {cellRisks.length > 3 && (
                              <li className="text-muted-foreground">
                                ...y {cellRisks.length - 3} más
                              </li>
                            )}
                          </ul>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-xs font-medium text-muted-foreground">
              SEVERIDAD
            </span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {totalRisks === 0 && (
        <div className="mt-4 p-4 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            No hay riesgos identificados. Agregue riesgos a la matriz IPER.
          </p>
        </div>
      )}
    </div>
  );
}
