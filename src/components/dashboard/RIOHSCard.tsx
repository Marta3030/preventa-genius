import { cn } from "@/lib/utils";
import { FileText, Download, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRIOHS, useDocumentAcknowledgements } from "@/hooks/usePrevention";
import { RIOHSUploadDialog } from "@/components/prevention/RIOHSUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface RIOHSCardProps {
  className?: string;
}

export function RIOHSCard({ className }: RIOHSCardProps) {
  const { isAdmin } = useAuth();
  const { data: riohs, isLoading: isLoadingRIOHS } = useRIOHS();
  const { data: acknowledgements, isLoading: isLoadingAck } = useDocumentAcknowledgements(riohs?.id);

  // Placeholder for total employees (would come from employees table in production)
  const totalEmployees = 180;
  const acknowledgedCount = acknowledgements?.length || 0;
  const acknowledgedPercentage = totalEmployees > 0 
    ? (acknowledgedCount / totalEmployees) * 100 
    : 0;

  // Determine status based on expiry date
  const getStatus = () => {
    if (!riohs?.expiry_date) return "vigente";
    const daysUntilExpiry = differenceInDays(parseISO(riohs.expiry_date), new Date());
    if (daysUntilExpiry < 0) return "vencido";
    if (daysUntilExpiry <= 30) return "por_vencer";
    return "vigente";
  };

  const status = getStatus();

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

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  if (isLoadingRIOHS) {
    return (
      <div className={cn("bg-card rounded-xl border border-border p-5", className)}>
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-2 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    );
  }

  // No RIOHS uploaded yet
  if (!riohs) {
    return (
      <div className={cn("bg-card rounded-xl border border-border p-5 animate-fade-in", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted border border-border">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Reglamento Interno (RIOHS)
              </h3>
              <p className="text-sm text-muted-foreground">
                No hay documento cargado
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-4">
          <p className="text-sm text-warning-foreground">
            <strong>Importante:</strong> Suba el Reglamento Interno de Orden, Higiene y Seguridad 
            para comenzar el proceso de firmas de trabajadores.
          </p>
        </div>

        {isAdmin && (
          <RIOHSUploadDialog 
            trigger={
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Subir RIOHS
              </Button>
            }
          />
        )}
      </div>
    );
  }

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
              Versión {riohs.version} • Vigente desde{" "}
              {format(parseISO(riohs.created_at), "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            statusInfo.color
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusInfo.label}
        </div>
      </div>

      {/* Acknowledgment progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Firmas de trabajadores</span>
          <span className="font-medium text-foreground">
            {acknowledgedCount}/{totalEmployees}
          </span>
        </div>
        <Progress value={acknowledgedPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {acknowledgedPercentage.toFixed(1)}% completado •{" "}
          {totalEmployees - acknowledgedCount} pendientes
        </p>
      </div>

      {/* Registration status */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-4">
        {riohs.registered_with_dt ? (
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

      {/* Expiry date if exists */}
      {riohs.expiry_date && (
        <div className="text-xs text-muted-foreground mb-4">
          Vence: {format(parseISO(riohs.expiry_date), "dd/MM/yyyy", { locale: es })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => window.open(riohs.file_url, '_blank')}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Descargar
        </Button>
        {isAdmin && (
          <RIOHSUploadDialog />
        )}
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => window.open(riohs.file_url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Ver
        </Button>
      </div>
    </div>
  );
}
