import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInspection } from '@/hooks/usePrevention';
import { Plus, Loader2, ClipboardCheck } from 'lucide-react';

const areaLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  rrhh: 'RRHH',
  reclutamiento: 'Reclutamiento',
  prevencion: 'Prevención',
  operaciones: 'Operaciones',
  comite_paritario: 'Comité Paritario',
};

export function InspectionForm() {
  const [open, setOpen] = useState(false);
  const createInspection = useCreateInspection();

  const [form, setForm] = useState({
    title: '',
    area: 'operaciones' as any,
    planned_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    await createInspection.mutateAsync({
      title: form.title,
      area: form.area,
      planned_date: form.planned_date,
      notes: form.notes || undefined,
      status: 'pendiente',
    } as any);

    setOpen(false);
    setForm({ title: '', area: 'operaciones', planned_date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inspección
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Nueva Inspección
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Inspección de extintores" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área *</Label>
              <Select value={form.area} onValueChange={v => setForm(p => ({ ...p, area: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(areaLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha planificada *</Label>
              <Input type="date" value={form.planned_date} onChange={e => setForm(p => ({ ...p, planned_date: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observaciones..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createInspection.isPending || !form.title}>
              {createInspection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Inspección
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
