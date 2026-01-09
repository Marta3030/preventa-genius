import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateOperationalTask, useAvailableEmployees } from '@/hooks/useOperations';
import { toast } from 'sonner';
import { ClipboardList, Plus, AlertTriangle, Ban } from 'lucide-react';
import { Enums } from '@/integrations/supabase/types';

type AreaType = Enums<'area_type'>;

const areaLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  rrhh: 'RRHH',
  reclutamiento: 'Reclutamiento',
  prevencion: 'Prevención',
  operaciones: 'Operaciones',
  comite_paritario: 'Comité Paritario',
};

const priorityLabels = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const riskLevels = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
];

export function TaskForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<AreaType>('operaciones');
  const [priority, setPriority] = useState('medium');
  const [riskLevel, setRiskLevel] = useState('bajo');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  const createTask = useCreateOperationalTask();
  const { data: employees } = useAvailableEmployees();

  const selectedEmployee = employees?.find(e => e.id === assignedTo);
  const isEmployeeBlocked = selectedEmployee?.blocked_for_tasks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (isEmployeeBlocked) {
      toast.error(`No se puede asignar a ${selectedEmployee?.name}. ${selectedEmployee?.blocked_reason || 'Empleado bloqueado'}`);
      return;
    }

    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        area,
        priority,
        risk_level: riskLevel,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      });

      toast.success('Tarea creada exitosamente');
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la tarea');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setArea('operaciones');
    setPriority('medium');
    setRiskLevel('bajo');
    setAssignedTo('');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Crear Tarea Operacional
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Select value={area} onValueChange={(v) => setArea(v as AreaType)}>
                <SelectTrigger id="area">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(areaLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLabels.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger id="riskLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha Límite</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Asignar a</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem 
                    key={emp.id} 
                    value={emp.id}
                    disabled={emp.blocked_for_tasks}
                  >
                    <div className="flex items-center gap-2">
                      {emp.blocked_for_tasks && <Ban className="h-3 w-3 text-destructive" />}
                      <span className={emp.blocked_for_tasks ? 'text-muted-foreground line-through' : ''}>
                        {emp.name}
                      </span>
                      {emp.blocked_for_tasks && (
                        <span className="text-xs text-destructive">(Bloqueado)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEmployeeBlocked && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{selectedEmployee?.blocked_reason || 'Este empleado está bloqueado para tareas de riesgo'}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTask.isPending || isEmployeeBlocked}>
              {createTask.isPending ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
