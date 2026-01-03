import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskCell {
  probability: number;
  severity: number;
  count: number;
}

const mockRiskData: RiskCell[] = [
  { probability: 1, severity: 4, count: 2 },
  { probability: 2, severity: 3, count: 5 },
  { probability: 2, severity: 4, count: 1 },
  { probability: 3, severity: 2, count: 8 },
  { probability: 3, severity: 3, count: 3 },
  { probability: 4, severity: 1, count: 12 },
  { probability: 4, severity: 2, count: 6 },
  { probability: 1, severity: 2, count: 4 },
];

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
  const getRiskCount = (prob: number, sev: number): number => {
    const cell = mockRiskData.find(
      (r) => r.probability === prob && r.severity === sev
    );
    return cell?.count || 0;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Matriz de Riesgos</h3>
          <p className="text-sm text-muted-foreground">
            IPER - Identificación de Peligros
          </p>
        </div>
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
                      <TooltipContent>
                        <p className="font-medium">
                          {count} riesgo{count !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {probLabel} probabilidad / {severityLabels[sevIndex]} severidad
                        </p>
                        <p className="text-xs mt-1">
                          Nivel: <span className="font-medium">{riskLabels[level]}</span>
                        </p>
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
    </div>
  );
}
