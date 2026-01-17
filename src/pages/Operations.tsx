import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TaskForm } from '@/components/operations/TaskForm';
import { useOperationalTasks, useOperationsStats, useUpdateOperationalTask } from '@/hooks/useOperations';
import { 
  Wrench, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  User,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-muted text-muted-foreground',
};

const areaLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  rrhh: 'RRHH',
  reclutamiento: 'Reclutamiento',
  prevencion: 'Prevención',
  operaciones: 'Operaciones',
  comite_paritario: 'Comité Paritario',
};

export default function Operations() {
  const { data: tasks, isLoading } = useOperationalTasks();
  const { data: stats } = useOperationsStats();
  const updateTask = useUpdateOperationalTask();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      });
      toast.success('Estado actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    }
  };

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 transition-all duration-300">
        <div className="p-6 space-y-6 max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                Operaciones
              </h1>
              <p className="text-muted-foreground">Gestión de tareas operacionales</p>
            </div>
            <TaskForm />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
                    <p className="text-xs text-muted-foreground">En Progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.overdue || 0}</p>
                    <p className="text-xs text-muted-foreground">Vencidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.highPriority || 0}</p>
                    <p className="text-xs text-muted-foreground">Alta Prioridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                En Progreso ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completadas ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            {['pending', 'in_progress', 'completed'].map((status) => {
              const filteredTasks = tasks?.filter(t => t.status === status) || [];
              
              return (
                <TabsContent key={status} value={status}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Tareas {statusLabels[status]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <p className="text-muted-foreground text-center py-8">Cargando...</p>
                      ) : filteredTasks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No hay tareas {statusLabels[status].toLowerCase()}
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tarea</TableHead>
                              <TableHead>Área</TableHead>
                              <TableHead>Prioridad</TableHead>
                              <TableHead>Asignado a</TableHead>
                              <TableHead>Fecha Límite</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTasks.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{task.title}</p>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {areaLabels[task.area] || task.area}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={priorityColors[task.priority]}
                                  >
                                    {priorityLabels[task.priority] || task.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {task.employee ? (
                                    <div className="flex items-center gap-2">
                                      {task.employee.blocked_for_tasks ? (
                                        <Ban className="h-4 w-4 text-destructive" />
                                      ) : (
                                        <User className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className={task.employee.blocked_for_tasks ? 'text-destructive' : ''}>
                                        {task.employee.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Sin asignar</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {task.due_date ? (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span>{new Date(task.due_date).toLocaleDateString('es-CL')}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                                      >
                                        Iniciar
                                      </Button>
                                    )}
                                    {status === 'in_progress' && (
                                      <Button 
                                        size="sm" 
                                        variant="default"
                                        onClick={() => handleStatusChange(task.id, 'completed')}
                                      >
                                        Completar
                                      </Button>
                                    )}
                                    {status === 'completed' && (
                                      <Badge variant="outline" className={statusColors.completed}>
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Completada
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
