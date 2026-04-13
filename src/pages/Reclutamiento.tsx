import { useIsMobile } from '@/hooks/use-mobile';
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
  useVacancies, 
  useCreateVacancy, 
  useUpdateVacancy,
  useCandidates,
  useCreateCandidate,
  useAdvanceCandidate,
  useReclutamientoStats
} from '@/hooks/useReclutamiento';
import { 
  Briefcase, 
  Users, 
  UserPlus, 
  Plus, 
  Eye,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-yellow-100 text-yellow-800',
  filled: 'bg-blue-100 text-blue-800'
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  closed: 'Cerrada',
  filled: 'Cubierta'
};

const candidateStatusColors: Record<string, string> = {
  received: 'bg-gray-100 text-gray-800',
  screening: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-yellow-100 text-yellow-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const candidateStatusLabels: Record<string, string> = {
  received: 'Recibido',
  screening: 'En Revisión',
  interview: 'Entrevista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado'
};

const pipelineStages = ['received', 'screening', 'interview', 'offer', 'hired'];

const areaLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  rrhh: 'RRHH',
  reclutamiento: 'Reclutamiento',
  prevencion: 'Prevención',
  operaciones: 'Operaciones',
  comite_paritario: 'Comité Paritario'
};

export default function Reclutamiento() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { data: vacancies, isLoading: loadingVacancies } = useVacancies();
  const { data: candidates, isLoading: loadingCandidates } = useCandidates();
  const { data: stats } = useReclutamientoStats();
  const createVacancy = useCreateVacancy();
  const updateVacancy = useUpdateVacancy();
  const createCandidate = useCreateCandidate();
  const advanceCandidate = useAdvanceCandidate();

  const [isVacancyOpen, setIsVacancyOpen] = useState(false);
  const [isCandidateOpen, setIsCandidateOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);
  
  const [newVacancy, setNewVacancy] = useState({
    title: '',
    description: '',
    area: 'operaciones',
    requirements: '',
    salary_range: '',
    positions_count: 1
  });

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    rut: '',
    cover_letter: ''
  });

  const handleCreateVacancy = async () => {
    if (!user || !newVacancy.title) return;
    try {
      await createVacancy.mutateAsync({
        ...newVacancy,
        created_by: user.id,
        company_id: null,
        published_at: null,
        closes_at: null,
        status: 'draft'
      });
      toast({ title: 'Vacante creada correctamente' });
      setIsVacancyOpen(false);
      setNewVacancy({ title: '', description: '', area: 'operaciones', requirements: '', salary_range: '', positions_count: 1 });
    } catch (error) {
      toast({ title: 'Error al crear vacante', variant: 'destructive' });
    }
  };

  const handlePublishVacancy = async (id: string) => {
    try {
      await updateVacancy.mutateAsync({ 
        id, 
        status: 'published', 
        published_at: new Date().toISOString() 
      });
      toast({ title: 'Vacante publicada' });
    } catch (error) {
      toast({ title: 'Error al publicar', variant: 'destructive' });
    }
  };

  const handleCreateCandidate = async () => {
    if (!selectedVacancy || !newCandidate.name || !newCandidate.email) return;
    try {
      await createCandidate.mutateAsync({
        ...newCandidate,
        vacancy_id: selectedVacancy,
        status: 'received',
        cv_url: null,
        score: null,
        notes: null
      });
      toast({ title: 'Candidato agregado' });
      setIsCandidateOpen(false);
      setNewCandidate({ name: '', email: '', phone: '', rut: '', cover_letter: '' });
    } catch (error) {
      toast({ title: 'Error al agregar candidato', variant: 'destructive' });
    }
  };

  const handleAdvanceCandidate = async (candidateId: string, currentStage: string) => {
    if (!user) return;
    const currentIndex = pipelineStages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= pipelineStages.length - 1) return;
    
    const nextStage = pipelineStages[currentIndex + 1];
    try {
      await advanceCandidate.mutateAsync({
        candidateId,
        stage: nextStage,
        movedBy: user.id
      });
      toast({ title: `Candidato avanzado a: ${candidateStatusLabels[nextStage]}` });
    } catch (error) {
      toast({ title: 'Error al avanzar candidato', variant: 'destructive' });
    }
  };

  const activeVacancies = vacancies?.filter(v => v.status === 'published') || [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={isMobile ? "pl-0 pt-14" : "pl-64 transition-all duration-300"}>
        <div className="p-6 space-y-6 max-w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-primary" />
                Reclutamiento
              </h1>
              <p className="text-muted-foreground">Gestión de vacantes y candidatos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                if (activeVacancies.length > 0) {
                  setSelectedVacancy(activeVacancies[0].id);
                  setIsCandidateOpen(true);
                } else {
                  toast({ title: 'Primero debe crear y publicar una vacante', variant: 'destructive' });
                }
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Candidato
              </Button>
              <Dialog open={isVacancyOpen} onOpenChange={setIsVacancyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Vacante
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Vacante</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Título del cargo</Label>
                      <Input
                        value={newVacancy.title}
                        onChange={e => setNewVacancy(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Operador de Maquinaria"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Área</Label>
                      <Select
                        value={newVacancy.area}
                        onValueChange={v => setNewVacancy(prev => ({ ...prev, area: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(areaLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={newVacancy.description}
                        onChange={e => setNewVacancy(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del cargo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Requisitos</Label>
                      <Textarea
                        value={newVacancy.requirements}
                        onChange={e => setNewVacancy(prev => ({ ...prev, requirements: e.target.value }))}
                        placeholder="Requisitos del cargo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rango Salarial</Label>
                        <Input
                          value={newVacancy.salary_range}
                          onChange={e => setNewVacancy(prev => ({ ...prev, salary_range: e.target.value }))}
                          placeholder="Ej: $800.000 - $1.200.000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Posiciones</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newVacancy.positions_count}
                          onChange={e => setNewVacancy(prev => ({ ...prev, positions_count: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateVacancy} className="w-full" disabled={createVacancy.isPending}>
                      Crear Vacante
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
                    <p className="text-sm text-muted-foreground">Vacantes Activas</p>
                    <p className="text-3xl font-bold text-primary">{stats?.activeVacancies || 0}</p>
                  </div>
                  <Briefcase className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidatos Totales</p>
                    <p className="text-3xl font-bold">{stats?.totalCandidates || 0}</p>
                  </div>
                  <Users className="h-10 w-10 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En Proceso</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.inProcess || 0}</p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contratados</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.hired || 0}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="vacancies" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vacancies" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Vacantes ({vacancies?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="candidates" className="gap-2">
                <Users className="h-4 w-4" />
                Candidatos ({candidates?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="gap-2">
                <FileText className="h-4 w-4" />
                Pipeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vacancies">
              <Card>
                <CardHeader>
                  <CardTitle>Vacantes</CardTitle>
                  <CardDescription>Gestione las vacantes disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVacancies ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : vacancies?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay vacantes registradas</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Posiciones</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Publicada</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vacancies?.map(vacancy => (
                          <TableRow key={vacancy.id}>
                            <TableCell className="font-medium">{vacancy.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {areaLabels[vacancy.area] || vacancy.area}
                              </Badge>
                            </TableCell>
                            <TableCell>{vacancy.positions_count}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[vacancy.status]}>
                                {statusLabels[vacancy.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {vacancy.published_at 
                                ? format(new Date(vacancy.published_at), 'dd/MM/yyyy', { locale: es })
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {vacancy.status === 'draft' && isAdmin && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePublishVacancy(vacancy.id)}
                                  disabled={updateVacancy.isPending}
                                >
                                  Publicar
                                </Button>
                              )}
                              {vacancy.status === 'published' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedVacancy(vacancy.id);
                                    setIsCandidateOpen(true);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4" />
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

            <TabsContent value="candidates">
              <Card>
                <CardHeader>
                  <CardTitle>Candidatos</CardTitle>
                  <CardDescription>Todos los candidatos en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCandidates ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                  ) : candidates?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay candidatos registrados</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vacante</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Postulación</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates?.map(candidate => (
                          <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{candidate.name}</TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.vacancies?.title || '-'}</TableCell>
                            <TableCell>
                              <Badge className={candidateStatusColors[candidate.status]}>
                                {candidateStatusLabels[candidate.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(candidate.applied_at), 'dd/MM/yyyy', { locale: es })}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {candidate.status !== 'hired' && candidate.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAdvanceCandidate(candidate.id, candidate.status)}
                                  disabled={advanceCandidate.isPending}
                                >
                                  <ChevronRight className="h-4 w-4" />
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

            <TabsContent value="pipeline">
              <div className="grid grid-cols-5 gap-4">
                {pipelineStages.map(stage => {
                  const stageCandidates = candidates?.filter(c => c.status === stage) || [];
                  return (
                    <Card key={stage}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          {candidateStatusLabels[stage]}
                          <Badge variant="secondary">{stageCandidates.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {stageCandidates.map(candidate => (
                          <Card key={candidate.id} className="p-3">
                            <p className="font-medium text-sm">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{candidate.vacancies?.title}</p>
                            {stage !== 'hired' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full mt-2"
                                onClick={() => handleAdvanceCandidate(candidate.id, stage)}
                              >
                                Avanzar <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </Card>
                        ))}
                        {stageCandidates.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">Sin candidatos</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Candidate Dialog */}
      <Dialog open={isCandidateOpen} onOpenChange={setIsCandidateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Candidato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {activeVacancies.length > 1 && (
              <div className="space-y-2">
                <Label>Vacante</Label>
                <Select value={selectedVacancy || ''} onValueChange={setSelectedVacancy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vacante" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeVacancies.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input
                value={newCandidate.name}
                onChange={e => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del candidato"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newCandidate.email}
                onChange={e => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={newCandidate.phone}
                  onChange={e => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label>RUT</Label>
                <Input
                  value={newCandidate.rut}
                  onChange={e => setNewCandidate(prev => ({ ...prev, rut: e.target.value }))}
                  placeholder="12.345.678-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Carta de presentación</Label>
              <Textarea
                value={newCandidate.cover_letter}
                onChange={e => setNewCandidate(prev => ({ ...prev, cover_letter: e.target.value }))}
                placeholder="Carta de presentación del candidato"
              />
            </div>
            <Button onClick={handleCreateCandidate} className="w-full" disabled={createCandidate.isPending}>
              Agregar Candidato
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
