import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateIncident } from "@/hooks/usePrevention";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";

const incidentSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(10, "Describa el incidente con más detalle"),
  area: z.enum(["gerencia", "rrhh", "reclutamiento", "prevencion", "operaciones", "comite_paritario"]),
  severity: z.enum(["leve", "moderado", "grave", "catastrofico"]),
  incident_date: z.string().min(1, "Fecha requerida"),
  location: z.string().optional(),
  type: z.enum(["accident", "incident", "near_miss", "occupational_disease"]).optional(),
  immediate_actions: z.string().optional(),
  days_lost: z.number().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  trigger?: React.ReactNode;
}

const areaLabels: Record<string, string> = {
  gerencia: "Gerencia",
  rrhh: "Recursos Humanos",
  reclutamiento: "Reclutamiento",
  prevencion: "Prevención de Riesgos",
  operaciones: "Operaciones",
  comite_paritario: "Comité Paritario",
};

const severityLabels: Record<string, string> = {
  leve: "Leve",
  moderado: "Moderado",
  grave: "Grave",
  catastrofico: "Catastrófico",
};

const typeLabels: Record<string, string> = {
  accident: "Accidente",
  incident: "Incidente",
  near_miss: "Cuasi accidente",
  occupational_disease: "Enfermedad ocupacional",
};

export function IncidentForm({ trigger }: IncidentFormProps) {
  const [open, setOpen] = useState(false);
  const createIncident = useCreateIncident();
  
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "operaciones",
      severity: "leve",
      incident_date: new Date().toISOString().split("T")[0],
      location: "",
      type: "incident",
      immediate_actions: "",
      days_lost: 0,
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    await createIncident.mutateAsync({
      title: data.title,
      description: data.description,
      area: data.area,
      severity: data.severity,
      incident_date: new Date(data.incident_date).toISOString(),
      location: data.location,
      type: data.type,
      immediate_actions: data.immediate_actions,
      days_lost: data.days_lost,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="shadow-safety">
            <Plus className="h-4 w-4 mr-2" />
            Reportar Incidente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Reportar Incidente / Accidente
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Título del incidente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Caída en área de producción" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severidad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar severidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(severityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(areaLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="incident_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del incidente *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Planta A, Sección 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days_lost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días perdidos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción detallada *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa qué ocurrió, cómo ocurrió, lesiones, daños materiales, etc."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="immediate_actions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acciones inmediatas tomadas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa las acciones tomadas inmediatamente después del incidente"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createIncident.isPending}>
                {createIncident.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reportar Incidente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
