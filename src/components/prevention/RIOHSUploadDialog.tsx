import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUploadRIOHS, useRIOHS } from "@/hooks/usePrevention";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface RIOHSUploadDialogProps {
  trigger?: React.ReactNode;
}

export function RIOHSUploadDialog({ trigger }: RIOHSUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [registeredWithDT, setRegisteredWithDT] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadRIOHS = useUploadRIOHS();
  const { data: currentRIOHS } = useRIOHS();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      // Auto-increment version
      if (currentRIOHS) {
        setVersion((currentRIOHS.version + 1).toString());
      } else {
        setVersion("1");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version) return;

    await uploadRIOHS.mutateAsync({
      file,
      version: parseFloat(version),
      expiryDate: expiryDate || undefined,
      registeredWithDT,
    });

    setFile(null);
    setVersion("");
    setExpiryDate("");
    setRegisteredWithDT(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1.5" />
            Subir Nueva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Subir Nuevo RIOHS
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
              accept=".pdf"
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
                  Click para seleccionar archivo PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: PDF • Máx: 10MB
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Versión *</Label>
              <Input
                id="version"
                type="number"
                step="0.1"
                min="0.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ej: 3.2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Fecha de vencimiento</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="registered-dt" className="text-sm font-medium">
                Registrado en Dirección del Trabajo
              </Label>
              <p className="text-xs text-muted-foreground">
                Marcar si el documento ya fue registrado
              </p>
            </div>
            <Switch
              id="registered-dt"
              checked={registeredWithDT}
              onCheckedChange={setRegisteredWithDT}
            />
          </div>

          {currentRIOHS && (
            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
              <p className="text-sm text-info">
                <strong>Nota:</strong> La versión actual (v{currentRIOHS.version}) será
                desactivada al subir esta nueva versión.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!file || !version || uploadRIOHS.isPending}>
              {uploadRIOHS.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Subir RIOHS
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
