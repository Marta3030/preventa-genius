import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useIncidents } from '@/hooks/usePrevention';
import { toast } from 'sonner';
import { Plus, Loader2, Shield } from 'lucide-react';

export function CorrectiveActionForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: incidents } = useIncidents();

  const [form, setForm] = useState({
    title: '',
    description: '',
    action_type: 'corrective',
    priority: 'medium',
    due_date: '',
    incident_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.due_date || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('corrective_actions').insert({
        title: form.title,
        description: form.description || null,
        action_type: form.action_type,
        priority: form.priority,
        due_date: form.due_date,
        incident_id: form.incident_id || null,
        owner_id: user.id,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Acción correctiva creada');
      queryClient.invalidateQueries({ queryKey: ['corrective-actions'] });
      setOpen(false);
      setForm({ title: '', description: '', action_type: 'corrective', priority: 'medium', due_date: '', incident_id: '' });
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Acción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Nueva Acción Correctiva
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Instalar barandas de seguridad" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalle de la acción..." />
          </div>
          <div className="space-y-2">
            <Label>Incidente asociado</Label>
            <Select value={form.incident_id} onValueChange={v => setForm(p => ({ ...p, incident_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Seleccionar incidente (opcional)..." /></SelectTrigger>
              <SelectContent>
                {incidents?.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.action_type} onValueChange={v => setForm(p => ({ ...p, action_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Correctiva</SelectItem>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="improvement">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha límite *</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !form.title || !form.due_date}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Acción
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
