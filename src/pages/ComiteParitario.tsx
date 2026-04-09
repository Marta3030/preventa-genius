import { useState, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { 
  useCommitteeMembers, 
  useCreateCommitteeMember,
  useCommitteeMeetings,
  useCreateCommitteeMeeting,
  useUpdateCommitteeMeeting,
  useMinutesActions,
  useCreateMinutesAction,
  useUpdateMinutesAction,
  useComiteStats
} from '@/hooks/useComiteParitario';
import { 
  Users2, 
  Calendar, 
  FileText, 
  Plus, 
  Eye,
  CheckCircle2,
  Clock,
  UserPlus,
  ClipboardList,
  Upload,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const roleLabels: Record<string, string> = {
  presidente: 'Presidente',
  secretario: 'Secretario',
  representante_empresa: 'Rep. Empresa',
  representante_trabajadores: 'Rep. Trabajadores'
};

const representationLabels: Record<string, string> = {
  empresa: 'Empresa',
  trabajadores: 'Trabajadores'
};

const meetingStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const meetingStatusLabels: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En Curso',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

const actionStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
};

const actionStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  overdue: 'Vencida'
};

export default function ComiteParitario() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { data: members, isLoading: loadingMembers } = useCommitteeMembers();
  const { data: meetings, isLoading: loadingMeetings } = useCommitteeMeetings();
  const { data: actions, isLoading: loadingActions } = useMinutesActions();
  const { data: stats } = useComiteStats();
  
  const createMember = useCreateCommitteeMember();
  const createMeeting = useCreateCommitteeMeeting();
  const updateMeeting = useUpdateCommitteeMeeting();
  const createAction = useCreateMinutesAction();
  const updateAction = useUpdateMinutesAction();

  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'representante_trabajadores',
    representation: 'trabajadores',
    start_date: ''
  });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    meeting_date: '',
    location: '',
    agenda: ''
  });

  const [newAction, setNewAction] = useState({
    description: '',
    owner_name: '',
    due_date: ''
  });

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.start_date) return;
    try {
      await createMember.mutateAsync({
        ...newMember,
        employee_id: null,
        user_id: null,
        end_date: null,
        status: 'active'
      });
      toast({ title: 'Miembro agregado correctamente' });
      setIsMemberOpen(false);
      setNewMember({ name: '', role: 'representante_trabajadores', representation: 'trabajadores', start_date: '' });
    } catch (error) {
      toast({ title: 'Error al agregar miembro', variant: 'destructive' });
    }
  };

  const handleCreateMeeting = async () => {
    if (!user || !newMeeting.title || !newMeeting.meeting_date) return;
    try {
      await createMeeting.mutateAsync({
        ...newMeeting,
        created_by: user.id,
        attendees: null,
        minutes_doc_id: null,
        status: 'scheduled',
        notes: null
      });
      toast({ title: 'Reunión programada correctamente' });
      setIsMeetingOpen(false);
      setNewMeeting({ title: '', meeting_date: '', location: '', agenda: '' });
    } catch (error) {
      toast({ title: 'Error al programar reunión', variant: 'destructive' });
    }
  };

  const handleCompleteMeeting = async (id: string) => {
    try {
      await updateMeeting.mutateAsync({ id, status: 'completed' });
      toast({ title: 'Reunión marcada como completada' });
    } catch (error) {
      toast({ title: 'Error al actualizar reunión', variant: 'destructive' });
    }
  };

  const handleCreateAction = async () => {
    if (!selectedMeeting || !newAction.description) return;
    try {
      await createAction.mutateAsync({
        meeting_id: selectedMeeting,
        description: newAction.description,
        owner_name: newAction.owner_name || null,
        owner_id: null,
        due_date: newAction.due_date || null,
        status: 'pending',
        notes: null
      });
      toast({ title: 'Acuerdo agregado correctamente' });
      setIsActionOpen(false);
      setNewAction({ description: '', owner_name: '', due_date: '' });
    } catch (error) {
      toast({ title: 'Error al agregar acuerdo', variant: 'destructive' });
    }
  };

  const handleCompleteAction = async (id: string) => {
    try {
      await updateAction.mutateAsync({ id, status: 'completed' });
      toast({ title: 'Acuerdo marcado como completado' });
    } catch (error) {
      toast({ title: 'Error al actualizar acuerdo', variant: 'destructive' });
    }
  };

  const activeMembers = members?.filter(m => m.status === 'active') || [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 transition-all duration-300">
        <div className="p-6 space-y-6 max-w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users2 className="h-8 w-8 text-primary" />
                Comité Paritario
              </h1>
              <p className="text-muted-foreground">Gestión del Comité Paritario de Higiene y Seguridad</p>
            </div>
            <div className="flex gap-2">
                  <Dialog open={isMemberOpen} onOpenChange={setIsMemberOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Nuevo Miembro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agregar Miembro del Comité</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={newMember.name}
                            onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre del miembro"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rol</Label>
                          <Select
                            value={newMember.role}
                            onValueChange={v => setNewMember(prev => ({ ...prev, role: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Representación</Label>
                          <Select
                            value={newMember.representation}
                            onValueChange={v => setNewMember(prev => ({ ...prev, representation: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="empresa">Empresa</SelectItem>
                              <SelectItem value="trabajadores">Trabajadores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha de inicio</Label>
                          <Input
                            type="date"
                            value={newMember.start_date}
                            onChange={e => setNewMember(prev => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleCreateMember} className="w-full" disabled={createMember.isPending}>
                          Agregar Miembro
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Reunión
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Programar Reunión</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={newMeeting.title}
                            onChange={e => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ej: Reunión Ordinaria Enero"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha y hora</Label>
                          <Input
                            type="datetime-local"
                            value={newMeeting.meeting_date}
                            onChange={e => setNewMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Lugar</Label>
                          <Input
                            value={newMeeting.location}
                            onChange={e => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Sala de reuniones"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Agenda</Label>
                          <Textarea
                            value={newMeeting.agenda}
                            onChange={e => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))}
                            placeholder="Puntos a tratar en la reunión"
                          />
                        </div>
                        <Button onClick={handleCreateMeeting} className="w-full" disabled={createMeeting.isPending}>
                          Programar Reunión
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Miembros Activos</p>
                    <p className="text-3xl font-bold text-primary">{stats?.activeMembers || 0}</p>
                  </div>
                  <Users2 className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reuniones Realizadas</p>
                    <p className="text-3xl font-bold">{stats?.completedMeetings || 0}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acuerdos Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.pendingActions || 0}</p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Reunión</p>
                    <p className="text-lg font-bold">
                      {stats?.nextMeeting 
                        ? format(new Date(stats.nextMeeting), 'dd/MM', { locale: es })
                        : 'Sin programar'
                      }
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members" className="gap-2">
                <Users2 className="h-4 w-4" />
                Miembros ({activeMembers.length})
              </TabsTrigger>
              <TabsTrigger value="meetings" className="gap-2">
                <Calendar className="h-4 w-4" />
                Reuniones ({meetings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="actions" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Acuerdos ({actions?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Miembros del Comité</CardTitle>
                  <CardDescription>Representantes de empresa y trabajadores</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : activeMembers.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay miembros registrados</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeMembers.map(member => (
                        <Card key={member.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-sm text-muted-foreground">{roleLabels[member.role]}</p>
                                <Badge variant="outline" className="mt-2">
                                  {representationLabels[member.representation]}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                              Desde: {format(new Date(member.start_date), 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meetings">
              <Card>
                <CardHeader>
                  <CardTitle>Reuniones</CardTitle>
                  <CardDescription>Historial y programación de reuniones</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMeetings ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : meetings?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay reuniones registradas</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Lugar</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetings?.map(meeting => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">{meeting.title}</TableCell>
                            <TableCell>
                              {format(new Date(meeting.meeting_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell>{meeting.location || '-'}</TableCell>
                            <TableCell>
                              <Badge className={meetingStatusColors[meeting.status]}>
                                {meetingStatusLabels[meeting.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {meeting.status === 'scheduled' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteMeeting(meeting.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              {meeting.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMeeting(meeting.id);
                                    setIsActionOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
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

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Acuerdos y Compromisos</CardTitle>
                  <CardDescription>Seguimiento de acuerdos de reuniones</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingActions ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : actions?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay acuerdos registrados</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Responsable</TableHead>
                          <TableHead>Fecha Límite</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {actions?.map(action => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium max-w-xs truncate">{action.description}</TableCell>
                            <TableCell>{action.owner_name || '-'}</TableCell>
                            <TableCell>
                              {action.due_date 
                                ? format(new Date(action.due_date), 'dd/MM/yyyy', { locale: es })
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge className={actionStatusColors[action.status]}>
                                {actionStatusLabels[action.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {action.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteAction(action.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Acuerdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descripción del acuerdo</Label>
              <Textarea
                value={newAction.description}
                onChange={e => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del acuerdo o compromiso"
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Input
                value={newAction.owner_name}
                onChange={e => setNewAction(prev => ({ ...prev, owner_name: e.target.value }))}
                placeholder="Nombre del responsable"
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
            <Button onClick={handleCreateAction} className="w-full" disabled={createAction.isPending}>
              Agregar Acuerdo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
