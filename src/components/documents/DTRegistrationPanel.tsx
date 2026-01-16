import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDTRegistrationTasks, useCreateDTRegistration, useUpdateDTRegistration, generateDTExportPackage, usePendingSignatures, useDocument } from "@/hooks/useDocuments";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { exportDTPackagePDF } from "@/lib/pdfExporter";
import { 
  Building, 
  FileText, 
  Package, 
  Check, 
  Clock, 
  Send,
  Download,
  Loader2,
  ExternalLink
} from "lucide-react";

interface DTRegistrationPanelProps {
  documentId: string;
  documentTitle: string;
  isRegistered?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  exported: { label: 'Paquete Generado', color: 'bg-info/10 text-info border-info/30', icon: Package },
  submitted: { label: 'Enviado a DT', color: 'bg-primary/10 text-primary border-primary/30', icon: Send },
  confirmed: { label: 'Confirmado', color: 'bg-success/10 text-success border-success/30', icon: Check },
};

export function DTRegistrationPanel({ documentId, documentTitle, isRegistered }: DTRegistrationPanelProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dtFolio, setDtFolio] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const { data: tasks, isLoading } = useDTRegistrationTasks(documentId);
  const { data: docData } = useDocument(documentId);
  const { data: signatures } = usePendingSignatures(documentId);
  const createTask = useCreateDTRegistration();
  const updateTask = useUpdateDTRegistration();

  const currentTask = tasks?.[0];

  const handleCreateTask = async () => {
    await createTask.mutateAsync({ documentId });
  };

  const handleExportPackagePDF = async () => {
    if (!docData || !signatures) return;
    setIsExportingPDF(true);
    try {
      await exportDTPackagePDF(
        {
          title: docData.title,
          version: docData.version,
          file_hash: docData.file_hash,
          effective_date: docData.effective_date,
          expiry_date: docData.expiry_date,
        },
        signatures
      );
      toast.success('PDF del paquete DT generado');
    } catch (error) {
      toast.error('Error al generar PDF: ' + (error as Error).message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportPackage = async () => {
    setIsExporting(true);
    try {
      const exportData = await generateDTExportPackage(documentId);
      
      // Create JSON metadata file
      const metadataBlob = new Blob(
        [JSON.stringify(exportData.metadata, null, 2)], 
        { type: 'application/json' }
      );
      const metadataUrl = URL.createObjectURL(metadataBlob);
      
      // Create signatures CSV
      const csvHeaders = ['Nombre', 'RUT', 'Área', 'Cargo', 'Fecha Firma', 'Método', 'IP'];
      const csvRows = exportData.signatures.map(sig => [
        sig.employee?.name || '',
        sig.employee?.rut || '',
        sig.employee?.area || '',
        sig.employee?.position || '',
        sig.signed_at || '',
        sig.signature_method || '',
        sig.signer_ip || '',
      ]);
      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvUrl = URL.createObjectURL(csvBlob);
      
      // Download metadata
      const metadataLink = window.document.createElement('a');
      metadataLink.href = metadataUrl;
      metadataLink.download = 'metadata.json';
      metadataLink.click();
      URL.revokeObjectURL(metadataUrl);
      
      // Download signatures CSV
      setTimeout(() => {
        const csvLink = window.document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = 'firmas.csv';
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
      }, 500);
      
      // Download document PDF
      setTimeout(() => {
        if (exportData.documentData.file_url) {
          window.open(exportData.documentData.file_url, '_blank');
        }
      }, 1000);
      
      // Update task status
      if (currentTask) {
        await updateTask.mutateAsync({
          id: currentTask.id,
          status: 'exported',
        });
      }
      
      toast.success('Paquete de exportación generado');
    } catch (error) {
      toast.error('Error al generar paquete: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };


  const handleMarkSubmitted = async () => {
    if (!currentTask) return;
    await updateTask.mutateAsync({
      id: currentTask.id,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
  };

  const handleConfirmRegistration = async () => {
    if (!currentTask || !dtFolio) return;
    await updateTask.mutateAsync({
      id: currentTask.id,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      dt_folio: dtFolio,
    });
    setConfirmDialogOpen(false);
    setDtFolio('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5" />
            Registro Dirección del Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isRegistered && !currentTask) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5" />
            Registro Dirección del Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <Check className="h-6 w-6 text-success" />
            <div>
              <p className="font-medium text-success">Documento registrado</p>
              <p className="text-sm text-success/80">
                Este documento ya está registrado en la Dirección del Trabajo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="h-5 w-5" />
          Registro Dirección del Trabajo
        </CardTitle>
        <CardDescription>
          Gestiona el registro del documento ante la DT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentTask ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              No hay tarea de registro activa para este documento
            </p>
            <Button onClick={handleCreateTask} disabled={createTask.isPending}>
              {createTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Iniciar Proceso de Registro
            </Button>
          </div>
        ) : (
          <>
            {/* Current status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = statusConfig[currentTask.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <>
                      <StatusIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Estado actual</p>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Creado:</p>
                <p>{format(parseISO(currentTask.created_at), "dd/MM/yyyy", { locale: es })}</p>
              </div>
            </div>

            {/* DT Folio if confirmed */}
            {currentTask.dt_folio && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground">Folio DT</p>
                <p className="font-mono font-bold text-lg">{currentTask.dt_folio}</p>
              </div>
            )}

            {/* Action buttons based on status */}
            <div className="flex flex-wrap gap-3">
              {currentTask.status === 'pending' && (
                <>
                  <Button onClick={handleExportPackage} disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    Generar Paquete Completo
                  </Button>
                  <Button variant="outline" onClick={handleExportPackagePDF} disabled={isExportingPDF}>
                    {isExportingPDF ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Exportar PDF
                  </Button>
                </>
              )}

              {currentTask.status === 'exported' && (
                <>
                  <Button variant="outline" onClick={handleExportPackage} disabled={isExporting}>
                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Descargar Paquete
                  </Button>
                  <Button variant="outline" onClick={handleExportPackagePDF} disabled={isExportingPDF}>
                    {isExportingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    PDF
                  </Button>
                  <Button onClick={handleMarkSubmitted} disabled={updateTask.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    Marcar como Enviado
                  </Button>
                </>
              )}

              {currentTask.status === 'submitted' && (
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Check className="h-4 w-4 mr-2" />
                      Confirmar Registro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Registro en DT</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="folio">Número de Folio DT *</Label>
                        <Input
                          id="folio"
                          value={dtFolio}
                          onChange={(e) => setDtFolio(e.target.value)}
                          placeholder="Ingrese el folio recibido"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleConfirmRegistration}
                        disabled={!dtFolio || updateTask.isPending}
                      >
                        {updateTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirmar Registro
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {currentTask.status === 'confirmed' && (
                <Button variant="outline" asChild>
                  <a 
                    href="https://www.dt.gob.cl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Portal DT
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
