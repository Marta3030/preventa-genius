import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2, GraduationCap } from 'lucide-react';

export function TrainingForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'company',
    duration_hours: '',
    expiry_months: '',
    is_legal_requirement: false,
    juridical_basis: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('trainings').insert({
        title: form.title,
        description: form.description || null,
        type: form.type,
        duration_hours: form.duration_hours ? parseInt(form.duration_hours) : null,
        expiry_months: form.expiry_months ? parseInt(form.expiry_months) : null,
        is_legal_requirement: form.is_legal_requirement,
        juridical_basis: form.juridical_basis || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success('Capacitación creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      setOpen(false);
      setForm({ title: '', description: '', type: 'company', duration_hours: '', expiry_months: '', is_legal_requirement: false, juridical_basis: '' });
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Capacitación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Nueva Capacitación
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Trabajo en Altura" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción de la capacitación..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="induction">Inducción</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duración (horas)</Label>
              <Input type="number" min="1" value={form.duration_hours} onChange={e => setForm(p => ({ ...p, duration_hours: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vigencia (meses)</Label>
              <Input type="number" min="1" value={form.expiry_months} onChange={e => setForm(p => ({ ...p, expiry_months: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Base jurídica</Label>
              <Input value={form.juridical_basis} onChange={e => setForm(p => ({ ...p, juridical_basis: e.target.value }))} placeholder="Ej: DS 594 Art. 3" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="legal-req">Requisito legal obligatorio</Label>
            <Switch id="legal-req" checked={form.is_legal_requirement} onCheckedChange={v => setForm(p => ({ ...p, is_legal_requirement: v }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !form.title}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Capacitación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
