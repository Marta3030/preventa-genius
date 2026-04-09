import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllDocuments, useDocumentStats, useDeleteDocument } from "@/hooks/useDocuments";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { SignatureCampaignDialog } from "@/components/documents/SignatureCampaignDialog";
import { SignatureTracker } from "@/components/documents/SignatureTracker";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { DTRegistrationPanel } from "@/components/documents/DTRegistrationPanel";
import { MyPendingSignatures } from "@/components/documents/MyPendingSignatures";
import { DocumentStatsDashboard } from "@/components/documents/DocumentStatsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText, Download, Eye, Send, Building, Check, Clock, FolderOpen, BarChart3, Trash2, Loader2
} from "lucide-react";

const documentTypeLabels: Record<string, string> = {
  riohs: 'RIOHS',
  procedimiento: 'Procedimiento',
  acta: 'Acta',
  informe: 'Informe',
  capacitacion: 'Capacitación',
  otro: 'Otro',
  política_sst: 'Política SST',
  iper: 'IPER',
  pise: 'PISE',
  protocolo: 'Protocolo',
  auditoria: 'Auditoría',
  procedimiento_seguro: 'Proc. Trabajo Seguro',
};

export default function Documents() {
  const { isAdmin } = useAuth();
  const { data: documents, isLoading } = useAllDocuments();
  const { data: stats } = useDocumentStats();
  const deleteDocument = useDeleteDocument();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("documents");

  const selectedDocument = documents?.find(d => d.id === selectedDoc);

  const handleDeleteDocument = async (documentId: string) => {
    await deleteDocument.mutateAsync(documentId);
    setSelectedDoc(null);
  };

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
              <DocumentUploadDialog />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* My Pending Signatures - visible for all users */}
          <MyPendingSignatures />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="stats" className="mt-6">
              <DocumentStatsDashboard />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
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
                                  <Badge className="bg-success/10 text-success border-success/30 text-xs"><Check className="h-3 w-3 mr-1" />Vigente</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">Obsoleto</Badge>
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
                                <>
                                  <SignatureCampaignDialog
                                    documentId={selectedDocument.id}
                                    documentTitle={selectedDocument.title}
                                  />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción no se puede deshacer. Se eliminarán todas las firmas pendientes, 
                                          acuses de recibo y tareas de registro DT asociadas a este documento.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteDocument(selectedDocument.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {deleteDocument.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                          )}
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
