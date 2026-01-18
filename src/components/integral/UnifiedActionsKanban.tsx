import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnifiedActions, useCreateUnifiedAction, useUpdateUnifiedAction, type UnifiedAction } from "@/hooks/useIntegralModule";
import { useEmployees } from "@/hooks/useRRHH";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  ArrowRight,
  Loader2,
  Target,
  Calendar
} from "lucide-react";

const statusColumns = [
  { id: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-muted' },
  { id: 'in_progress', label: 'En Progreso', icon: Play, color: 'bg-primary/10' },
  { id: 'completed', label: 'Completado', icon: CheckCircle, color: 'bg-success/10' },
];

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

const moduleLabels: Record<string, string> = {
  prevention: "Prevención",
  environment: "Medio Ambiente",
  quality: "Calidad",
};

interface ActionCardProps {
  action: UnifiedAction;
  onStatusChange: (id: string, newStatus: string) => void;
}

function ActionCard({ action, onStatusChange }: ActionCardProps) {
  const today = new Date();
  const dueDate = parseISO(action.due_date);
  const daysUntilDue = differenceInDays(dueDate, today);
  const isOverdue = daysUntilDue < 0 && action.status !== 'completed';

  return (
    <div className={`p-3 rounded-lg border bg-card ${isOverdue ? 'border-destructive/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {action.code}
        </Badge>
        <Badge variant="outline" className={priorityColors[action.priority]}>
          {priorityLabels[action.priority]}
        </Badge>
      </div>
      
      <h4 className="font-medium text-sm mb-1 line-clamp-2">{action.title}</h4>
      
      {action.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{action.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span className={isOverdue ? 'text-destructive' : ''}>
            {format(dueDate, "dd/MM", { locale: es })}
            {isOverdue && ` (${Math.abs(daysUntilDue)}d vencida)`}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {moduleLabels[action.module] || action.module}
        </Badge>
      </div>

      {action.progress_percentage > 0 && action.status !== 'completed' && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${action.progress_percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{action.progress_percentage}%</span>
        </div>
      )}

      {action.status !== 'completed' && (
        <div className="mt-2 flex gap-1">
          {action.status === 'pending' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs flex-1"
              onClick={() => onStatusChange(action.id, 'in_progress')}
            >
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
          )}
          {action.status === 'in_progress' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs flex-1"
              onClick={() => onStatusChange(action.id, 'completed')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Completar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function UnifiedActionsKanban() {
  const { isAdmin, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const { data: actions, isLoading } = useUnifiedActions();
  const { data: employees } = useEmployees();
  const createAction = useCreateUnifiedAction();
  const updateAction = useUpdateUnifiedAction();

  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    module: 'prevention',
    action_type: 'corrective',
    priority: 'medium',
    responsible_id: '',
    due_date: '',
  });

  const filteredActions = actions?.filter(a => 
    filter === 'all' || a.module === filter
  );

  const getActionsForStatus = (status: string) => 
    filteredActions?.filter(a => a.status === status) || [];

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAction.mutateAsync({
      id,
      status: newStatus,
      ...(newStatus === 'completed' ? { 
        closed_at: new Date().toISOString(),
        progress_percentage: 100 
      } : {}),
    });
  };

  const handleCreateAction = async () => {
    if (!newAction.title || !newAction.responsible_id || !newAction.due_date) return;
    
    await createAction.mutateAsync({
      ...newAction,
      status: 'pending',
      progress_percentage: 0,
    } as any);
    
    setOpen(false);
    setNewAction({
      title: '',
      description: '',
      module: 'prevention',
      action_type: 'corrective',
      priority: 'medium',
      responsible_id: '',
      due_date: '',
    });
  };

  const overdueCount = actions?.filter(a => 
    a.status !== 'completed' && differenceInDays(parseISO(a.due_date), new Date()) < 0
  ).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Gestión de Acciones
          </h3>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {overdueCount} vencidas
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="prevention">Prevención</SelectItem>
              <SelectItem value="environment">Medio Ambiente</SelectItem>
              <SelectItem value="quality">Calidad</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Acción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Acción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input 
                      value={newAction.title}
                      onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la acción..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <Textarea 
                      value={newAction.description}
                      onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción detallada..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Módulo</label>
                      <Select 
                        value={newAction.module} 
                        onValueChange={(v) => setNewAction(prev => ({ ...prev, module: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prevention">Prevención</SelectItem>
                          <SelectItem value="environment">Medio Ambiente</SelectItem>
                          <SelectItem value="quality">Calidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Select 
                        value={newAction.action_type} 
                        onValueChange={(v) => setNewAction(prev => ({ ...prev, action_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrective">Correctiva</SelectItem>
                          <SelectItem value="preventive">Preventiva</SelectItem>
                          <SelectItem value="improvement">Mejora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Prioridad</label>
                      <Select 
                        value={newAction.priority} 
                        onValueChange={(v) => setNewAction(prev => ({ ...prev, priority: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fecha Límite *</label>
                      <Input 
                        type="date"
                        value={newAction.due_date}
                        onChange={(e) => setNewAction(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Responsable *</label>
                    <Select 
                      value={newAction.responsible_id} 
                      onValueChange={(v) => setNewAction(prev => ({ ...prev, responsible_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione responsable..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.filter(e => e.status === 'active' && e.user_id).map((emp) => (
                          <SelectItem key={emp.id} value={emp.user_id!}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateAction} disabled={createAction.isPending}>
                      {createAction.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Crear Acción"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => {
          const Icon = column.icon;
          const columnActions = getActionsForStatus(column.id);
          
          return (
            <Card key={column.id} className={column.color}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {column.label}
                  <Badge variant="secondary" className="ml-auto">
                    {columnActions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {columnActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin acciones
                  </p>
                ) : (
                  columnActions.map((action) => (
                    <ActionCard 
                      key={action.id} 
                      action={action} 
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
