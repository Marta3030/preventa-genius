import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUploadDocument } from "@/hooks/useDocuments";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database['public']['Enums']['document_type'];

interface DocumentUploadDialogProps {
  trigger?: React.ReactNode;
  defaultType?: DocumentType;
  onSuccess?: () => void;
}

const documentTypeLabels: Record<DocumentType, string> = {
  riohs: 'RIOHS',
  procedimiento: 'Procedimiento',
  acta: 'Acta',
  informe: 'Informe',
  capacitacion: 'Capacitación',
  otro: 'Otro',
};

const areaOptions = [
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'rrhh', label: 'RRHH' },
  { value: 'prevencion', label: 'Prevención' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'reclutamiento', label: 'Reclutamiento' },
  { value: 'comite_paritario', label: 'Comité Paritario' },
];

export function DocumentUploadDialog({ trigger, defaultType, onSuccess }: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "">(defaultType || "");
  const [version, setVersion] = useState("1");
  const [expiryDate, setExpiryDate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [ownerArea, setOwnerArea] = useState("");
  const [registeredWithDT, setRegisteredWithDT] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadDocument = useUploadDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDocumentType(defaultType || "");
    setVersion("1");
    setExpiryDate("");
    setEffectiveDate("");
    setOwnerArea("");
    setRegisteredWithDT(false);
    setNotifyAll(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !documentType || !version) return;

    await uploadDocument.mutateAsync({
      file,
      title,
      documentType: documentType as DocumentType,
      version: parseFloat(version),
      expiryDate: expiryDate || undefined,
      effectiveDate: effectiveDate || undefined,
      registeredWithDT,
      notifyAll,
      ownerArea: ownerArea || undefined,
    });

    resetForm();
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Subir Nuevo Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click para seleccionar archivo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: PDF, DOC, DOCX • Máx: 10MB
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título del documento *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reglamento Interno RIOHS"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de documento *</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Versión *</Label>
              <Input
                id="version"
                type="number"
                step="0.1"
                min="0.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective">Fecha efectiva</Label>
              <Input
                id="effective"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Fecha vencimiento</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área responsable</Label>
            <Select value={ownerArea} onValueChange={setOwnerArea}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="notify-all" className="text-sm font-medium">
                  Notificar a todos los empleados
                </Label>
                <p className="text-xs text-muted-foreground">
                  Crear campaña de firmas automáticamente
                </p>
              </div>
              <Switch
                id="notify-all"
                checked={notifyAll}
                onCheckedChange={setNotifyAll}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="registered-dt" className="text-sm font-medium">
                  Registrado en Dirección del Trabajo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marcar si ya fue registrado
                </p>
              </div>
              <Switch
                id="registered-dt"
                checked={registeredWithDT}
                onCheckedChange={setRegisteredWithDT}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!file || !title || !documentType || !version || uploadDocument.isPending}
            >
              {uploadDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Subir Documento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
