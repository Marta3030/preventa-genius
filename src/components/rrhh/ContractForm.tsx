import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateContract, useEmployees } from '@/hooks/useRRHH';
import { toast } from 'sonner';
import { FileSignature } from 'lucide-react';

const contractSchema = z.object({
  employee_id: z.string().min(1, 'Seleccione empleado'),
  contract_type: z.string().min(1, 'Seleccione tipo'),
  start_date: z.string().min(1, 'Fecha requerida'),
  end_date: z.string().optional(),
  salary: z.coerce.number().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export function ContractForm() {
  const [open, setOpen] = useState(false);
  const createContract = useCreateContract();
  const { data: employees } = useEmployees();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      employee_id: '',
      contract_type: 'indefinido',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    },
  });

  const contractType = form.watch('contract_type');

  const onSubmit = async (data: ContractFormData) => {
    try {
      await createContract.mutateAsync({
        employee_id: data.employee_id,
        contract_type: data.contract_type,
        start_date: data.start_date,
        end_date: data.end_date || null,
        salary: data.salary || null,
      });
      toast.success('Contrato creado exitosamente');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Error al crear contrato');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSignature className="mr-2 h-4 w-4" />
          Nuevo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Contrato</DialogTitle>
          <DialogDescription>
            Cree un nuevo contrato para un empleado existente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empleado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.rut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="plazo_fijo">Plazo Fijo</SelectItem>
                      <SelectItem value="obra_faena">Por Obra o Faena</SelectItem>
                      <SelectItem value="honorarios">Honorarios</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(contractType === 'plazo_fijo' || contractType === 'obra_faena') && (
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Término</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sueldo Base (CLP)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createContract.isPending}>
                {createContract.isPending ? 'Creando...' : 'Crear Contrato'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
