import { useOnboardingTasks, useUpdateOnboardingTask, useEmployees } from '@/hooks/useRRHH';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  FileText, 
  Stethoscope, 
  GraduationCap, 
  HardHat,
  FileSignature,
  Clock,
  CheckCircle2 
} from 'lucide-react';

const taskTypeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  contract: <FileSignature className="h-4 w-4" />,
  health: <Stethoscope className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  epp: <HardHat className="h-4 w-4" />,
};

export function OnboardingList() {
  const { data: tasks, isLoading } = useOnboardingTasks();
  const { data: employees } = useEmployees();
  const updateTask = useUpdateOnboardingTask();

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];

  const getEmployeeName = (employeeId: string) => {
    return employees?.find(e => e.id === employeeId)?.name || 'Empleado';
  };

  const handleComplete = async (taskId: string) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status: 'completed' });
      toast.success('Tarea completada');
    } catch (error) {
      toast.error('Error al actualizar tarea');
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tareas de Onboarding Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tareas de Onboarding Pendientes
          {pendingTasks.length > 0 && (
            <Badge variant="secondary">{pendingTasks.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Todas las tareas de onboarding están completas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div 
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isOverdue(task.due_date) ? 'border-destructive bg-destructive/5' : 'bg-muted/30'
                }`}
              >
                <Checkbox 
                  checked={task.status === 'completed'}
                  onCheckedChange={() => handleComplete(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {taskTypeIcons[task.task_type] || taskTypeIcons.document}
                    <span className="font-medium truncate">{task.task_name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getEmployeeName(task.employee_id)}
                  </p>
                </div>
                <div className="text-right">
                  {task.due_date && (
                    <p className={`text-sm ${isOverdue(task.due_date) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {isOverdue(task.due_date) ? 'Vencido: ' : 'Vence: '}
                      {new Date(task.due_date).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleComplete(task.id)}
                  disabled={updateTask.isPending}
                >
                  Completar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
