import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePendingSignatures } from "@/hooks/useDocuments";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PenTool, Check, Clock, Send, Download } from "lucide-react";

interface SignatureTrackerProps {
  documentId: string;
  documentTitle: string;
}

export function SignatureTracker({ documentId, documentTitle }: SignatureTrackerProps) {
  const { data: signatures, isLoading } = usePendingSignatures(documentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="h-5 w-5" />
            Estado de Firmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalSignatures = signatures?.length || 0;
  const signedCount = signatures?.filter(s => s.status === 'signed').length || 0;
  const pendingCount = totalSignatures - signedCount;
  const progressPercent = totalSignatures > 0 ? (signedCount / totalSignatures) * 100 : 0;

  const exportSignaturesCSV = () => {
    if (!signatures || signatures.length === 0) return;
    
    const headers = ['Nombre', 'RUT', 'Área', 'Cargo', 'Estado', 'Fecha Firma', 'Método'];
    const rows = signatures.map(sig => [
      sig.employee?.name || '',
      sig.employee?.rut || '',
      sig.employee?.area || '',
      sig.employee?.position || '',
      sig.status === 'signed' ? 'Firmado' : 'Pendiente',
      sig.signed_at ? format(parseISO(sig.signed_at), 'dd/MM/yyyy HH:mm') : '',
      sig.signature_method || '',
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firmas_${documentTitle.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="h-5 w-5" />
            Estado de Firmas
          </CardTitle>
          {totalSignatures > 0 && (
            <Button variant="outline" size="sm" onClick={exportSignaturesCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSignatures === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay campaña de firmas activa</p>
            <p className="text-sm">Crea una campaña para solicitar firmas</p>
          </div>
        ) : (
          <>
            {/* Progress summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso de firmas</span>
                <span className="font-medium">{signedCount} / {totalSignatures}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-success">
                  <Check className="h-4 w-4" />
                  <span>{signedCount} firmados</span>
                </div>
                <div className="flex items-center gap-1.5 text-warning">
                  <Clock className="h-4 w-4" />
                  <span>{pendingCount} pendientes</span>
                </div>
              </div>
            </div>

            {/* Signatures table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Firma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signatures?.map((sig) => (
                  <TableRow key={sig.id}>
                    <TableCell className="font-medium">{sig.employee?.name || '—'}</TableCell>
                    <TableCell>{sig.employee?.rut || '—'}</TableCell>
                    <TableCell className="capitalize">
                      {sig.employee?.area?.replace('_', ' ') || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={sig.status === 'signed' 
                          ? 'bg-success/10 text-success border-success/30' 
                          : 'bg-warning/10 text-warning border-warning/30'
                        }
                      >
                        {sig.status === 'signed' ? 'Firmado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sig.signed_at 
                        ? format(parseISO(sig.signed_at), "dd/MM/yyyy HH:mm", { locale: es })
                        : '—'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
