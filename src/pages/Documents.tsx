import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllDocuments, useDocumentStats } from "@/hooks/useDocuments";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { SignatureCampaignDialog } from "@/components/documents/SignatureCampaignDialog";
import { SignatureTracker } from "@/components/documents/SignatureTracker";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { DTRegistrationPanel } from "@/components/documents/DTRegistrationPanel";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText, Download, Eye, Send, Building, Check, Clock, FolderOpen
} from "lucide-react";

const documentTypeLabels: Record<string, string> = {
  riohs: 'RIOHS',
  procedimiento: 'Procedimiento',
  acta: 'Acta',
  informe: 'Informe',
  capacitacion: 'Capacitación',
  otro: 'Otro',
};

export default function Documents() {
  const { isAdmin } = useAuth();
  const { data: documents, isLoading } = useAllDocuments();
  const { data: stats } = useDocumentStats();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const selectedDocument = documents?.find(d => d.id === selectedDoc);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 transition-all duration-300">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="h-7 w-7 text-primary" />
                Gestión de Documentos
              </h1>
              <p className="text-sm text-muted-foreground">
                Versionado • Firma Electrónica • Registro DT
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && <DocumentUploadDialog />}
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardDescription>Total Documentos</CardDescription><CardTitle className="text-3xl">{stats?.totalDocuments || 0}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Documentos Activos</CardDescription><CardTitle className="text-3xl text-success">{stats?.activeDocuments || 0}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Firmas Pendientes</CardDescription><CardTitle className="text-3xl text-warning">{stats?.pendingSignatures || 0}</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Registros DT Pendientes</CardDescription><CardTitle className="text-3xl text-info">{stats?.pendingDTRegistrations || 0}</CardTitle></CardHeader></Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Documents list */}
            <div className="col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>Selecciona para ver detalles</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
                  ) : documents?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay documentos</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                      {documents?.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc.id)}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedDoc === doc.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{documentTypeLabels[doc.document_type]}</Badge>
                                <span className="text-xs text-muted-foreground">v{doc.version}</span>
                              </div>
                            </div>
                            {doc.is_active ? (
                              <Badge className="bg-success/10 text-success border-success/30 text-xs"><Check className="h-3 w-3 mr-1" />Activo</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Inactivo</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(parseISO(doc.created_at), "dd MMM yyyy", { locale: es })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Document detail */}
            <div className="col-span-2 space-y-6">
              {!selectedDocument ? (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un documento para ver detalles</p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Document info card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedDocument.title}</CardTitle>
                          <CardDescription>
                            {documentTypeLabels[selectedDocument.document_type]} • Versión {selectedDocument.version}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(selectedDocument.file_url, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />Descargar
                          </Button>
                          {isAdmin && (
                            <SignatureCampaignDialog
                              documentId={selectedDocument.id}
                              documentTitle={selectedDocument.title}
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-muted-foreground">Fecha efectiva:</span><p className="font-medium">{selectedDocument.effective_date ? format(parseISO(selectedDocument.effective_date), "dd/MM/yyyy") : '—'}</p></div>
                        <div><span className="text-muted-foreground">Vencimiento:</span><p className="font-medium">{selectedDocument.expiry_date ? format(parseISO(selectedDocument.expiry_date), "dd/MM/yyyy") : '—'}</p></div>
                        <div><span className="text-muted-foreground">Hash:</span><p className="font-mono text-xs">{selectedDocument.file_hash?.substring(0, 16) || '—'}...</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="signatures">
                    <TabsList>
                      <TabsTrigger value="signatures"><Send className="h-4 w-4 mr-2" />Firmas</TabsTrigger>
                      <TabsTrigger value="versions"><FileText className="h-4 w-4 mr-2" />Versiones</TabsTrigger>
                      <TabsTrigger value="dt"><Building className="h-4 w-4 mr-2" />Registro DT</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signatures" className="mt-4">
                      <SignatureTracker documentId={selectedDocument.id} documentTitle={selectedDocument.title} />
                    </TabsContent>
                    <TabsContent value="versions" className="mt-4">
                      <DocumentVersionHistory documentId={selectedDocument.id} currentVersion={selectedDocument.version} />
                    </TabsContent>
                    <TabsContent value="dt" className="mt-4">
                      <DTRegistrationPanel documentId={selectedDocument.id} documentTitle={selectedDocument.title} isRegistered={selectedDocument.registered_with_dt} />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
