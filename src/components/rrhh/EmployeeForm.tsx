import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCreateEmployee } from '@/hooks/useRRHH';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

const areaOptions = [...Constants.public.Enums.area_type] as const;

const employeeSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  rut: z.string().min(8, 'RUT inválido'),
  position: z.string().min(2, 'Cargo requerido'),
  area: z.enum(areaOptions),
  date_joined: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeeForm() {
  const [open, setOpen] = useState(false);
  const createEmployee = useCreateEmployee();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      rut: '',
      position: '',
      area: 'operaciones',
      date_joined: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync({
        name: data.name,
        rut: data.rut,
        position: data.position,
        area: data.area as typeof areaOptions[number],
        date_joined: data.date_joined,
      });
      toast.success('Empleado creado exitosamente. Tareas de onboarding generadas automáticamente.');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Error al crear empleado');
      console.error(error);
    }
  };

  const areaLabels: Record<string, string> = {
    gerencia: 'Gerencia',
    rrhh: 'RRHH',
    reclutamiento: 'Reclutamiento',
    prevencion: 'Prevención',
    operaciones: 'Operaciones',
    comite_paritario: 'Comité Paritario',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Al crear el empleado se generarán automáticamente las tareas de onboarding y 
            se asignarán las capacitaciones legales obligatorias.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez González" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUT</FormLabel>
                  <FormControl>
                    <Input placeholder="12.345.678-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Operario de Producción" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areaOptions.map((area) => (
                        <SelectItem key={area} value={area}>
                          {areaLabels[area] || area}
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
              name="date_joined"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Ingreso</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? 'Creando...' : 'Crear Empleado'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
