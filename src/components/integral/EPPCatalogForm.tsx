import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateEPPCatalogItem } from '@/hooks/useIntegralModule';
import { Plus, Loader2, HardHat } from 'lucide-react';

const categories = [
  { value: 'cabeza', label: '🪖 Cabeza' },
  { value: 'ojos', label: '🥽 Ojos' },
  { value: 'oídos', label: '🎧 Oídos' },
  { value: 'respiratorio', label: '😷 Respiratorio' },
  { value: 'manos', label: '🧤 Manos' },
  { value: 'pies', label: '👢 Pies' },
  { value: 'cuerpo', label: '🦺 Cuerpo' },
  { value: 'caidas', label: '🪢 Caídas' },
  { value: 'general', label: '🛡️ General' },
];

export function EPPCatalogForm() {
  const [open, setOpen] = useState(false);
  const createItem = useCreateEPPCatalogItem();

  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'general',
    description: '',
    useful_life_months: 12,
    unit_cost: '',
    supplier: '',
    requires_size: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;

    await createItem.mutateAsync({
      code: form.code,
      name: form.name,
      category: form.category,
      description: form.description || undefined,
      useful_life_months: form.useful_life_months,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      supplier: form.supplier || undefined,
      requires_size: form.requires_size,
      is_active: true,
    } as any);

    setOpen(false);
    setForm({ code: '', name: '', category: 'general', description: '', useful_life_months: 12, unit_cost: '', supplier: '', requires_size: false });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar EPP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            Agregar EPP al Catálogo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="Ej: EPP-001" required />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Casco de seguridad" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del EPP..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vida útil (meses)</Label>
              <Input type="number" min="1" value={form.useful_life_months} onChange={e => setForm(p => ({ ...p, useful_life_months: parseInt(e.target.value) || 12 }))} />
            </div>
            <div className="space-y-2">
              <Label>Costo unitario</Label>
              <Input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value }))} placeholder="$" />
            </div>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="req-size">Requiere talla</Label>
            <Switch id="req-size" checked={form.requires_size} onCheckedChange={v => setForm(p => ({ ...p, requires_size: v }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createItem.isPending || !form.code || !form.name}>
              {createItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar al Catálogo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
