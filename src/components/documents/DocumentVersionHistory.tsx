import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentVersions } from "@/hooks/useDocuments";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { History, Download, FileText, Check } from "lucide-react";

interface DocumentVersionHistoryProps {
  documentId: string;
  currentVersion: number;
}

export function DocumentVersionHistory({ documentId, currentVersion }: DocumentVersionHistoryProps) {
  const { data: versions, isLoading } = useDocumentVersions(documentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Historial de Versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historial de Versiones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No hay versiones anteriores
          </p>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div 
                key={version.id}
                className={`p-4 rounded-lg border ${
                  version.version === currentVersion 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Versión {version.version}</span>
                        {version.version === currentVersion && (
                          <Badge variant="default" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Actual
                          </Badge>
                        )}
                        {!version.is_active && version.version !== currentVersion && (
                          <Badge variant="outline" className="text-xs">
                            Inactiva
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(version.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(version.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                </div>
                
                {version.file_hash && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    Hash: {version.file_hash.substring(0, 16)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
