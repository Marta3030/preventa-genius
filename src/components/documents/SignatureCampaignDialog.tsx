import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSignatureCampaign } from "@/hooks/useDocuments";
import { Send, Users, Building2, Loader2 } from "lucide-react";

interface SignatureCampaignDialogProps {
  documentId: string;
  documentTitle: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const areaOptions = [
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'rrhh', label: 'RRHH' },
  { value: 'prevencion', label: 'Prevención' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'reclutamiento', label: 'Reclutamiento' },
  { value: 'comite_paritario', label: 'Comité Paritario' },
];

export function SignatureCampaignDialog({ 
  documentId, 
  documentTitle, 
  trigger, 
  onSuccess 
}: SignatureCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'area'>('all');
  const [selectedArea, setSelectedArea] = useState('');
  
  const createCampaign = useCreateSignatureCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createCampaign.mutateAsync({
      documentId,
      allEmployees: targetType === 'all',
      byArea: targetType === 'area' ? selectedArea : undefined,
    });

    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Campaña de Firmas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Nueva Campaña de Firmas
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">Documento:</p>
            <p className="text-sm text-muted-foreground">{documentTitle}</p>
          </div>

          <div className="space-y-4">
            <Label>¿A quién enviar la solicitud de firma?</Label>
            
            <RadioGroup 
              value={targetType} 
              onValueChange={(v) => setTargetType(v as 'all' | 'area')}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="all" id="all" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-primary" />
                    Todos los empleados
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviar a todos los empleados activos de la empresa
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="area" id="area" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="area" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-4 w-4 text-primary" />
                    Por área específica
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviar solo a empleados de un área
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {targetType === 'area' && (
            <div className="space-y-2">
              <Label htmlFor="select-area">Seleccionar área</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir área..." />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="p-3 rounded-lg bg-info/10 border border-info/20">
            <p className="text-sm text-info">
              <strong>Nota:</strong> Los empleados recibirán una notificación para firmar el documento.
              Podrás hacer seguimiento del estado de las firmas.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending || (targetType === 'area' && !selectedArea)}
            >
              {createCampaign.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Iniciar Campaña
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
