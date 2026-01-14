import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMyPendingSignatures, useSignDocument } from "@/hooks/useDocuments";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  FileText, 
  PenTool, 
  Clock, 
  ExternalLink, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck
} from "lucide-react";

interface PendingSignatureWithDoc {
  id: string;
  document_id: string;
  employee_id: string;
  requested_at: string;
  status: string;
  document: {
    id: string;
    title: string;
    document_type: string;
    file_url: string;
    version: number;
  };
}

const documentTypeLabels: Record<string, string> = {
  riohs: 'RIOHS',
  procedimiento: 'Procedimiento',
  acta: 'Acta',
  informe: 'Informe',
  capacitacion: 'Capacitación',
  otro: 'Otro',
};

export function MyPendingSignatures() {
  const { data: pendingSignatures, isLoading } = useMyPendingSignatures();
  const signDocument = useSignDocument();
  
  const [selectedSignature, setSelectedSignature] = useState<PendingSignatureWithDoc | null>(null);
  const [hasRead, setHasRead] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleOpenSignDialog = (sig: PendingSignatureWithDoc) => {
    setSelectedSignature(sig);
    setHasRead(false);
    setAcceptTerms(false);
  };

  const handleSign = async () => {
    if (!selectedSignature) return;
    
    await signDocument.mutateAsync({
      signatureId: selectedSignature.id,
      documentId: selectedSignature.document_id,
    });
    
    setSelectedSignature(null);
  };

  const canSign = hasRead && acceptTerms;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Mis Firmas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const signatures = (pendingSignatures || []) as PendingSignatureWithDoc[];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Mis Firmas Pendientes
          </CardTitle>
          <CardDescription>
            Documentos que requieren tu firma de lectura
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
              <p className="font-medium">¡Todo al día!</p>
              <p className="text-sm">No tienes documentos pendientes de firma.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signatures.map((sig) => (
                <div 
                  key={sig.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sig.document.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {documentTypeLabels[sig.document.document_type] || sig.document.document_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          v{sig.document.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Solicitado {formatDistanceToNow(parseISO(sig.requested_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={sig.document.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver
                      </a>
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleOpenSignDialog(sig)}
                    >
                      <PenTool className="h-4 w-4 mr-1" />
                      Firmar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Document Dialog */}
      <Dialog open={!!selectedSignature} onOpenChange={(open) => !open && setSelectedSignature(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Firmar Documento
            </DialogTitle>
            <DialogDescription>
              Confirma que has leído y comprendido el documento.
            </DialogDescription>
          </DialogHeader>

          {selectedSignature && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-medium">{selectedSignature.document.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {documentTypeLabels[selectedSignature.document.document_type]}
                  </Badge>
                  <Badge variant="secondary">
                    Versión {selectedSignature.document.version}
                  </Badge>
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto mt-2"
                  asChild
                >
                  <a 
                    href={selectedSignature.document.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir documento en nueva pestaña
                  </a>
                </Button>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="has-read" 
                    checked={hasRead}
                    onCheckedChange={(checked) => setHasRead(checked === true)}
                  />
                  <Label 
                    htmlFor="has-read" 
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    Declaro que he leído completamente el documento y comprendo su contenido.
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="accept-terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <Label 
                    htmlFor="accept-terms" 
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    Acepto cumplir con las disposiciones, normativas y procedimientos descritos en este documento.
                  </Label>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Tu firma electrónica quedará registrada junto con la fecha, hora y dirección IP. 
                  Este registro tiene validez legal.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedSignature(null)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSign}
              disabled={!canSign || signDocument.isPending}
            >
              {signDocument.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Firmando...
                </>
              ) : (
                <>
                  <PenTool className="h-4 w-4 mr-2" />
                  Confirmar Firma
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
