import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateRisk } from "@/hooks/usePrevention";
import { ShieldAlert, Plus, Loader2 } from "lucide-react";

const riskSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  area: z.enum(["gerencia", "rrhh", "reclutamiento", "prevencion", "operaciones", "comite_paritario"]),
  probability: z.number().min(1).max(4),
  severity: z.number().min(1).max(4),
  controls: z.string().optional(),
});

type RiskFormData = z.infer<typeof riskSchema>;

interface RiskFormProps {
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

const probabilityLabels = [
  { value: 1, label: "Muy Alta" },
  { value: 2, label: "Alta" },
  { value: 3, label: "Media" },
  { value: 4, label: "Baja" },
];

const severityLabels = [
  { value: 1, label: "Leve" },
  { value: 2, label: "Moderada" },
  { value: 3, label: "Grave" },
  { value: 4, label: "Catastrófica" },
];

function calculateResidualRisk(probability: number, severity: number): 'bajo' | 'medio' | 'alto' | 'critico' {
  const score = probability * severity;
  if (score >= 12) return 'critico';
  if (score >= 8) return 'alto';
  if (score >= 4) return 'medio';
  return 'bajo';
}

export function RiskForm({ trigger }: RiskFormProps) {
  const [open, setOpen] = useState(false);
  const createRisk = useCreateRisk();
  
  const form = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "operaciones",
      probability: 3,
      severity: 2,
      controls: "",
    },
  });

  const probability = form.watch("probability");
  const severity = form.watch("severity");
  const residualRisk = calculateResidualRisk(probability, severity);

  const riskLevelColors = {
    bajo: "bg-success/10 text-success border-success/30",
    medio: "bg-primary/10 text-primary border-primary/30",
    alto: "bg-warning/10 text-warning border-warning/30",
    critico: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const riskLevelLabels = {
    bajo: "Bajo",
    medio: "Medio",
    alto: "Alto",
    critico: "Crítico",
  };

  const onSubmit = async (data: RiskFormData) => {
    await createRisk.mutateAsync({
      title: data.title,
      description: data.description,
      area: data.area,
      probability: data.probability,
      severity: data.severity,
      residual_risk: residualRisk,
      controls: data.controls,
      status: "activo",
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Riesgo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Agregar Riesgo a Matriz IPER
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peligro identificado *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Superficies resbaladizas en área húmeda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del riesgo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa el riesgo, actividades afectadas y consecuencias potenciales"
                      {...field} 
                    />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probabilidad *</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(parseInt(v))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {probabilityLabels.map((item) => (
                          <SelectItem key={item.value} value={item.value.toString()}>
                            {item.label}
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
                    <Select 
                      onValueChange={(v) => field.onChange(parseInt(v))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {severityLabels.map((item) => (
                          <SelectItem key={item.value} value={item.value.toString()}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Risk Level Preview */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nivel de riesgo calculado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${riskLevelColors[residualRisk]}`}>
                  {riskLevelLabels[residualRisk]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Score: {probability} × {severity} = {probability * severity}
              </p>
            </div>

            <FormField
              control={form.control}
              name="controls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medidas de control</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa las medidas de control existentes o propuestas"
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
              <Button type="submit" disabled={createRisk.isPending}>
                {createRisk.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar Riesgo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
