import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Employee, OnboardingTask } from '@/hooks/useRRHH';
import { User, Briefcase, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  onboardingTasks?: OnboardingTask[];
  onViewDetails?: (id: string) => void;
}

export function EmployeeCard({ employee, onboardingTasks = [], onViewDetails }: EmployeeCardProps) {
  const completedTasks = onboardingTasks.filter(t => t.status === 'completed').length;
  const totalTasks = onboardingTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const areaLabels: Record<string, string> = {
    gerencia: 'Gerencia',
    rrhh: 'RRHH',
    reclutamiento: 'Reclutamiento',
    prevencion: 'Prevención',
    operaciones: 'Operaciones',
    comite_paritario: 'Comité Paritario',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    inactive: 'bg-muted text-muted-foreground',
    on_leave: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{employee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{employee.rut}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[employee.status] || statusColors.active}>
            {employee.status === 'active' ? 'Activo' : employee.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{employee.position}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(employee.date_joined).toLocaleDateString('es-CL')}</span>
          </div>
        </div>

        <div>
          <Badge variant="secondary">{areaLabels[employee.area] || employee.area}</Badge>
        </div>

        {employee.blocked_for_tasks && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Bloqueado: {employee.blocked_reason || 'Capacitación pendiente'}</span>
          </div>
        )}

        {totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Onboarding</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex flex-wrap gap-1">
              {onboardingTasks.slice(0, 3).map(task => (
                <Badge 
                  key={task.id} 
                  variant="outline"
                  className={task.status === 'completed' 
                    ? 'bg-green-500/10 text-green-600 border-green-200' 
                    : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                  }
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {task.task_name}
                </Badge>
              ))}
              {onboardingTasks.length > 3 && (
                <Badge variant="outline">+{onboardingTasks.length - 3} más</Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onViewDetails?.(employee.id)}
        >
          Ver Ficha Completa
        </Button>
      </CardContent>
    </Card>
  );
}
