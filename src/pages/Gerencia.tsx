import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  useManagementActions, 
  useCreateManagementAction, 
  useApproveManagementAction, 
  useRejectManagementAction,
  useGerenciaStats 
} from '@/hooks/useGerencia';
import { 
  Building2, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  FileText,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado'
};

const actionTypeLabels: Record<string, string> = {
  policy_approval: 'Aprobación de Política',
  document_review: 'Revisión de Documento',
  strategic_decision: 'Decisión Estratégica'
};

export default function Gerencia() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { data: actions, isLoading } = useManagementActions();
  const { data: stats } = useGerenciaStats();
  const createAction = useCreateManagementAction();
  const approveAction = useApproveManagementAction();
  const rejectAction = useRejectManagementAction();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    action_type: 'policy_approval',
    due_date: ''
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleCreate = async () => {
    if (!user || !newAction.title) return;

    try {
      await createAction.mutateAsync({
        ...newAction,
        created_by: user.id,
        status: 'pending',
        company_id: null,
        document_id: null,
        notes: null,
        due_date: newAction.due_date || null
      });
      toast({ title: 'Acción creada correctamente' });
      setIsCreateOpen(false);
      setNewAction({ title: '', description: '', action_type: 'policy_approval', due_date: '' });
    } catch (error) {
      toast({ title: 'Error al crear acción', variant: 'destructive' });
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      await approveAction.mutateAsync({ id, approved_by: user.id });
      toast({ title: 'Acción aprobada correctamente' });
    } catch (error) {
      toast({ title: 'Error al aprobar', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedActionId || !rejectReason) return;
    try {
      await rejectAction.mutateAsync({ id: selectedActionId, rejected_reason: rejectReason });
      toast({ title: 'Acción rechazada' });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedActionId(null);
    } catch (error) {
      toast({ title: 'Error al rechazar', variant: 'destructive' });
    }
  };

  const pendingActions = actions?.filter(a => a.status === 'pending') || [];
  const completedActions = actions?.filter(a => a.status !== 'pending') || [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                Gerencia
              </h1>
              <p className="text-muted-foreground">Panel de gestión y aprobaciones</p>
            </div>
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Acción
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Acción de Gestión</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={newAction.title}
                        onChange={e => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título de la acción"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={newAction.action_type}
                        onValueChange={v => setNewAction(prev => ({ ...prev, action_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="policy_approval">Aprobación de Política</SelectItem>
                          <SelectItem value="document_review">Revisión de Documento</SelectItem>
                          <SelectItem value="strategic_decision">Decisión Estratégica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={newAction.description}
                        onChange={e => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción detallada"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha límite</Label>
                      <Input
                        type="date"
                        value={newAction.due_date}
                        onChange={e => setNewAction(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full" disabled={createAction.isPending}>
                      Crear Acción
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aprobadas</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.approved || 0}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rechazadas</p>
                    <p className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo Prom. Aprob.</p>
                    <p className="text-3xl font-bold">{stats?.avgApprovalDays || 0}d</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({pendingActions.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Completadas ({completedActions.length})
              </TabsTrigger>
              <TabsTrigger value="kpis" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                KPIs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Pendientes de Aprobación</CardTitle>
                  <CardDescription>Revise y apruebe o rechace las solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : pendingActions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay acciones pendientes</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha Límite</TableHead>
                          <TableHead>Creada</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingActions.map(action => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium">{action.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {actionTypeLabels[action.action_type] || action.action_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {action.due_date 
                                ? format(new Date(action.due_date), 'dd/MM/yyyy', { locale: es })
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              {format(new Date(action.created_at), 'dd/MM/yyyy', { locale: es })}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {isAdmin && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => handleApprove(action.id)}
                                    disabled={approveAction.isPending}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedActionId(action.id);
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedActions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay acciones completadas</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Resolución</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedActions.map(action => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium">{action.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {actionTypeLabels[action.action_type] || action.action_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[action.status]}>
                                {statusLabels[action.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {action.approved_at 
                                ? format(new Date(action.approved_at), 'dd/MM/yyyy', { locale: es })
                                : format(new Date(action.updated_at), 'dd/MM/yyyy', { locale: es })
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kpis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Cumplimiento Global
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-5xl font-bold text-primary">
                        {stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                      </p>
                      <p className="text-muted-foreground mt-2">Tasa de aprobación</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Eficiencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-5xl font-bold text-primary">
                        {stats?.avgApprovalDays || 0}
                      </p>
                      <p className="text-muted-foreground mt-2">Días promedio de aprobación</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Acción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo del rechazo</Label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ingrese el motivo del rechazo"
              />
            </div>
            <Button 
              onClick={handleReject} 
              className="w-full" 
              variant="destructive"
              disabled={!rejectReason || rejectAction.isPending}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
