import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Employee, useEmployeeHealth, useContracts, useOnboardingTasks } from '@/hooks/useRRHH';
import { HealthExamForm } from './HealthExamForm';
import { 
  User, 
  Stethoscope, 
  FileSignature, 
  ClipboardList,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const examTypeLabels: Record<string, string> = {
  'pre-ocupacional': 'Pre-ocupacional',
  'periodico': 'Periódico',
  'egreso': 'De Egreso',
};

const resultLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'apto': { label: 'Apto', variant: 'default' },
  'apto_con_restricciones': { label: 'Apto con Restricciones', variant: 'secondary' },
  'no_apto': { label: 'No Apto', variant: 'destructive' },
  'pendiente': { label: 'Pendiente', variant: 'outline' },
};

const areaLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  rrhh: 'RRHH',
  reclutamiento: 'Reclutamiento',
  prevencion: 'Prevención',
  operaciones: 'Operaciones',
  comite_paritario: 'Comité Paritario',
};

const contractTypeLabels: Record<string, string> = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo Fijo',
  obra_faena: 'Obra/Faena',
  honorarios: 'Honorarios',
};

export function EmployeeDetailSheet({ employee, open, onOpenChange }: EmployeeDetailSheetProps) {
  const { data: healthRecords } = useEmployeeHealth(employee?.id);
  const { data: contracts } = useContracts(employee?.id);
  const { data: onboardingTasks } = useOnboardingTasks(employee?.id);

  if (!employee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl">{employee.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{employee.rut}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{areaLabels[employee.area] || employee.area}</Badge>
                <Badge variant={employee.status === 'active' ? 'default' : 'outline'}>
                  {employee.status === 'active' ? 'Activo' : employee.status}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{employee.position}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Ingreso: {new Date(employee.date_joined).toLocaleDateString('es-CL')}</span>
          </div>
        </div>

        {employee.blocked_for_tasks && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span>Bloqueado: {employee.blocked_reason || 'Capacitación pendiente'}</span>
          </div>
        )}

        <Separator className="my-4" />

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health" className="gap-1 text-xs">
              <Stethoscope className="h-3 w-3" />
              Salud
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1 text-xs">
              <FileSignature className="h-3 w-3" />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-1 text-xs">
              <ClipboardList className="h-3 w-3" />
              Onboarding
            </TabsTrigger>
          </TabsList>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Exámenes de Salud Ocupacional</h3>
              <HealthExamForm employeeId={employee.id} employeeName={employee.name} />
            </div>

            {healthRecords?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay exámenes registrados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {healthRecords?.map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {examTypeLabels[record.exam_type] || record.exam_type}
                        </CardTitle>
                        {record.result && resultLabels[record.result] && (
                          <Badge variant={resultLabels[record.result].variant}>
                            {resultLabels[record.result].label}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Fecha: {new Date(record.exam_date).toLocaleDateString('es-CL')}</span>
                      </div>
                      {record.next_exam_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Próximo: {new Date(record.next_exam_date).toLocaleDateString('es-CL')}</span>
                        </div>
                      )}
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <h3 className="text-sm font-medium">Historial de Contratos</h3>
            
            {contracts?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileSignature className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay contratos registrados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contracts?.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {contractTypeLabels[contract.contract_type] || contract.contract_type}
                        </CardTitle>
                        <Badge variant={contract.status === 'active' ? 'default' : 'outline'}>
                          {contract.status === 'active' ? 'Vigente' : contract.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4 space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Inicio: {new Date(contract.start_date).toLocaleDateString('es-CL')}
                      </div>
                      {contract.end_date && (
                        <div className="text-sm text-muted-foreground">
                          Término: {new Date(contract.end_date).toLocaleDateString('es-CL')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-4">
            <h3 className="text-sm font-medium">Tareas de Onboarding</h3>
            
            {onboardingTasks?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay tareas de onboarding</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {onboardingTasks?.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">{task.task_name}</span>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                      {task.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
