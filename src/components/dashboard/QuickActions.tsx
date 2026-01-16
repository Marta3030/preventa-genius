import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useRIOHS } from '@/hooks/usePrevention';
import { IncidentForm } from '@/components/prevention/IncidentForm';
import { RIOHSUploadDialog } from '@/components/prevention/RIOHSUploadDialog';
import { exportSignatureStatsPDF } from '@/lib/pdfExporter';
import { toast } from 'sonner';
import {
  FileCheck,
  Download,
  AlertTriangle,
  Calendar,
  ClipboardCheck,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();
  const { data: riohs } = useRIOHS();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportGerencialReport = async () => {
    setIsExporting(true);
    try {
      // Generar reporte gerencial con estadísticas
      const stats = {
        total: 45,
        signed: 38,
        pending: 7,
        completionRate: 84.4,
        byArea: [
          { area: 'Operaciones', signed: 15, pending: 3 },
          { area: 'RRHH', signed: 8, pending: 1 },
          { area: 'Prevención', signed: 10, pending: 2 },
          { area: 'Gerencia', signed: 5, pending: 1 },
        ],
        byMonth: [
          { month: 'Ene', signed: 10, pending: 2 },
          { month: 'Feb', signed: 12, pending: 1 },
          { month: 'Mar', signed: 16, pending: 4 },
        ],
        byDocument: [
          { title: 'RIOHS', signed: 30, pending: 5, total: 35 },
          { title: 'Política SST', signed: 8, pending: 2, total: 10 },
        ],
      };
      await exportSignatureStatsPDF(stats);
      toast.success('Informe gerencial exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar el informe');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewRiskMatrix = () => {
    navigate('/prevencion');
    // Scroll to risk matrix after navigation
    setTimeout(() => {
      const element = document.querySelector('[value="risks"]');
      if (element) {
        (element as HTMLElement).click();
      }
    }, 100);
  };

  const handleViewCommitteeMinutes = () => {
    navigate('/comite');
  };

  const handleNewInspection = () => {
    navigate('/prevencion');
    setTimeout(() => {
      const element = document.querySelector('[value="inspections"]');
      if (element) {
        (element as HTMLElement).click();
      }
    }, 100);
  };

  const handleDownloadRIOHS = () => {
    if (riohs?.file_url) {
      window.open(riohs.file_url, '_blank');
    } else {
      toast.error('No hay RIOHS disponible para descargar');
    }
  };

  const actions = [
    {
      label: 'Reglamento Interno',
      icon: FileCheck,
      action: 'riohs',
    },
    {
      label: 'Informe Gerencial',
      icon: Download,
      action: 'export',
      isLoading: isExporting,
    },
    {
      label: 'Matriz de Riesgos',
      icon: AlertTriangle,
      action: 'risks',
    },
    {
      label: 'Actas Comité',
      icon: Calendar,
      action: 'committee',
    },
    {
      label: 'Nueva Inspección',
      icon: ClipboardCheck,
      action: 'inspection',
    },
    {
      label: 'Reportar Incidente',
      icon: AlertTriangle,
      action: 'incident',
    },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'riohs':
        handleDownloadRIOHS();
        break;
      case 'export':
        handleExportGerencialReport();
        break;
      case 'risks':
        handleViewRiskMatrix();
        break;
      case 'committee':
        handleViewCommitteeMinutes();
        break;
      case 'inspection':
        handleNewInspection();
        break;
      default:
        break;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => {
            // Para "Reportar Incidente" usamos el IncidentForm
            if (action.action === 'incident') {
              return (
                <IncidentForm
                  key={action.label}
                  trigger={
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-primary/5 w-full"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs text-center">{action.label}</span>
                    </Button>
                  }
                />
              );
            }

            // Para "Reglamento Interno" con opción de subir si es admin
            if (action.action === 'riohs') {
              return (
                <Dialog key={action.label}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs text-center">{action.label}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reglamento Interno (RIOHS)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {riohs ? (
                        <>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-medium">{riohs.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Versión {riohs.version} • Vigente
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(riohs.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => window.open(riohs.file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                          </div>
                          <RIOHSUploadDialog />
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">
                            No hay RIOHS cargado
                          </p>
                          <RIOHSUploadDialog />
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            }

            // Resto de acciones
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleAction(action.action)}
                disabled={action.isLoading}
              >
                {action.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <action.icon className="h-5 w-5" />
                )}
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}