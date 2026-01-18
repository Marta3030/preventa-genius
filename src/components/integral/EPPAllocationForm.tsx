import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEPPCatalog, useCreateEPPAllocation } from "@/hooks/useIntegralModule";
import { useEmployees } from "@/hooks/useRRHH";
import { HardHat, Plus, Loader2 } from "lucide-react";

const formSchema = z.object({
  employee_id: z.string().min(1, "Seleccione un trabajador"),
  epp_catalog_id: z.string().min(1, "Seleccione un EPP"),
  quantity: z.number().min(1, "Mínimo 1 unidad"),
  size: z.string().optional(),
  delivery_date: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EPPAllocationFormProps {
  trigger?: React.ReactNode;
  employeeId?: string;
}

export function EPPAllocationForm({ trigger, employeeId }: EPPAllocationFormProps) {
  const [open, setOpen] = useState(false);
  const { data: catalog, isLoading: loadingCatalog } = useEPPCatalog();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const createAllocation = useCreateEPPAllocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: employeeId || "",
      epp_catalog_id: "",
      quantity: 1,
      size: "",
      delivery_date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const selectedEPP = catalog?.find(item => item.id === form.watch("epp_catalog_id"));

  const onSubmit = async (data: FormData) => {
    const eppItem = catalog?.find(item => item.id === data.epp_catalog_id);
    let expiryDate: string | undefined;
    
    if (eppItem?.useful_life_months) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + eppItem.useful_life_months);
      expiryDate = expiry.toISOString().split('T')[0];
    }

    await createAllocation.mutateAsync({
      employee_id: data.employee_id,
      epp_catalog_id: data.epp_catalog_id,
      quantity: data.quantity,
      size: data.size,
      delivery_date: data.delivery_date,
      notes: data.notes,
      expiry_date: expiryDate,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <HardHat className="h-4 w-4" />
            Asignar EPP
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            Asignar Equipo de Protección Personal
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!employeeId && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione trabajador..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingEmployees ? (
                          <div className="p-2 text-center text-muted-foreground">Cargando...</div>
                        ) : (
                          employees?.filter(e => e.status === 'active').map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} - {emp.rut}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="epp_catalog_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo de Protección *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione EPP..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingCatalog ? (
                        <div className="p-2 text-center text-muted-foreground">Cargando...</div>
                      ) : (
                        catalog?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.code} - {item.name} ({item.category})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEPP?.requires_size && (
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Talla</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedEPP.sizes_available?.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre la entrega..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedEPP && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Vida útil:</strong> {selectedEPP.useful_life_months || 12} meses</p>
                <p><strong>Categoría:</strong> {selectedEPP.category}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAllocation.isPending}>
                {createAllocation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Asignar EPP
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
