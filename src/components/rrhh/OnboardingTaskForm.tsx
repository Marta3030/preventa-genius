import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEmployees } from '@/hooks/useRRHH';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2, ClipboardList } from 'lucide-react';

const taskTypes = [
  { value: 'document', label: 'Documento' },
  { value: 'contract', label: 'Contrato' },
  { value: 'health', label: 'Salud' },
  { value: 'training', label: 'Capacitación' },
  { value: 'epp', label: 'EPP' },
];

export function OnboardingTaskForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: employees } = useEmployees();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    employee_id: '',
    task_name: '',
    task_type: 'document',
    due_date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.task_name) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('onboarding_tasks')
        .insert({
          employee_id: form.employee_id,
          task_name: form.task_name,
          task_type: form.task_type,
          due_date: form.due_date || null,
          notes: form.notes || null,
          status: 'pending',
        });
      
      if (error) throw error;
      toast.success('Tarea de onboarding creada');
      queryClient.invalidateQueries({ queryKey: ['onboarding_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['rrhh_stats'] });
      setOpen(false);
      setForm({ employee_id: '', task_name: '', task_type: 'document', due_date: '', notes: '' });
    } catch (error: any) {
      toast.error('Error al crear tarea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Nueva Tarea de Onboarding
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Empleado *</Label>
            <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.filter(e => e.status === 'active').map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.rut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nombre de la tarea *</Label>
            <Input
              value={form.task_name}
              onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))}
              placeholder="Ej: Firma de contrato"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.task_type} onValueChange={v => setForm(p => ({ ...p, task_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha límite</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Observaciones..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !form.employee_id || !form.task_name}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
