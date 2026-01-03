import { cn } from "@/lib/utils";
import { FileText, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RIOHSCardProps {
  className?: string;
}

export function RIOHSCard({ className }: RIOHSCardProps) {
  const riohsData = {
    status: "vigente" as const,
    version: "3.2",
    effectiveDate: "01/03/2024",
    expiryDate: "01/03/2025",
    registeredDT: true,
    employeesAcknowledged: 156,
    employeesRequired: 180,
  };

  const acknowledgedPercentage =
    (riohsData.employeesAcknowledged / riohsData.employeesRequired) * 100;

  const statusConfig = {
    vigente: {
      label: "Vigente",
      color: "bg-success/10 text-success border-success/30",
      icon: CheckCircle2,
    },
    por_vencer: {
      label: "Por Vencer",
      color: "bg-warning/10 text-warning border-warning/30",
      icon: AlertCircle,
    },
    vencido: {
      label: "Vencido",
      color: "bg-destructive/10 text-destructive border-destructive/30",
      icon: AlertCircle,
    },
  };

  const status = statusConfig[riohsData.status];
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Reglamento Interno (RIOHS)
            </h3>
            <p className="text-sm text-muted-foreground">
              Versión {riohsData.version} • Vigente desde{" "}
              {riohsData.effectiveDate}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            status.color
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </div>
      </div>

      {/* Acknowledgment progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Firmas de trabajadores</span>
          <span className="font-medium text-foreground">
            {riohsData.employeesAcknowledged}/{riohsData.employeesRequired}
          </span>
        </div>
        <Progress value={acknowledgedPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {acknowledgedPercentage.toFixed(1)}% completado •{" "}
          {riohsData.employeesRequired - riohsData.employeesAcknowledged}{" "}
          pendientes
        </p>
      </div>

      {/* Registration status */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-4">
        {riohsData.registeredDT ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm text-foreground">
              Registrado en Dirección del Trabajo
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-foreground">
              Pendiente registro en DT
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-1.5" />
          Descargar
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Upload className="h-4 w-4 mr-1.5" />
          Subir Nueva
        </Button>
        <Button size="sm" className="flex-1">
          Ver Documento
        </Button>
      </div>
    </div>
  );
}
