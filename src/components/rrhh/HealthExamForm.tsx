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
import { useCreateHealthRecord } from '@/hooks/useRRHH';
import { toast } from 'sonner';
import { Stethoscope, Plus } from 'lucide-react';

interface HealthExamFormProps {
  employeeId: string;
  employeeName: string;
}

const examTypes = [
  { value: 'pre-ocupacional', label: 'Pre-ocupacional' },
  { value: 'periodico', label: 'Periódico' },
  { value: 'egreso', label: 'De Egreso' },
];

const examResults = [
  { value: 'apto', label: 'Apto' },
  { value: 'apto_con_restricciones', label: 'Apto con Restricciones' },
  { value: 'no_apto', label: 'No Apto' },
  { value: 'pendiente', label: 'Pendiente de Resultados' },
];

export function HealthExamForm({ employeeId, employeeName }: HealthExamFormProps) {
  const [open, setOpen] = useState(false);
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [nextExamDate, setNextExamDate] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');

  const createHealthRecord = useCreateHealthRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examType || !examDate) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      await createHealthRecord.mutateAsync({
        employee_id: employeeId,
        exam_type: examType,
        exam_date: examDate,
        next_exam_date: nextExamDate || null,
        result: result || null,
        notes: notes || null,
      });

      toast.success('Examen de salud registrado exitosamente');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al registrar el examen');
    }
  };

  const resetForm = () => {
    setExamType('');
    setExamDate('');
    setNextExamDate('');
    setResult('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Examen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Registrar Examen de Salud
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{employeeName}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType">Tipo de Examen *</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger id="examType">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Fecha del Examen *</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Resultado</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger id="result">
                <SelectValue placeholder="Seleccionar resultado" />
              </SelectTrigger>
              <SelectContent>
                {examResults.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextExamDate">Próximo Examen</Label>
            <Input
              id="nextExamDate"
              type="date"
              value={nextExamDate}
              onChange={(e) => setNextExamDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createHealthRecord.isPending}>
              {createHealthRecord.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
