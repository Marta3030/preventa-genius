import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { EmployeeForm } from '@/components/rrhh/EmployeeForm';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { EmployeeCard } from '@/components/rrhh/EmployeeCard';
import { OnboardingList } from '@/components/rrhh/OnboardingList';
import { OnboardingTaskForm } from '@/components/rrhh/OnboardingTaskForm';
import { ContractForm } from '@/components/rrhh/ContractForm';
import { EmployeeDetailSheet } from '@/components/rrhh/EmployeeDetailSheet';
import { 
  useEmployees, 
  useOnboardingTasks, 
  useContracts, 
  useRRHHStats,
  Employee
} from '@/hooks/useRRHH';
import { useAllDocuments } from '@/hooks/useDocuments';
import { 
  Users, 
  FileSignature, 
  ClipboardList, 
  AlertCircle,
  Search,
  LayoutGrid,
  List,
  Download,
  FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RRHH() {
  const isMobile = useIsMobile();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: onboardingTasks } = useOnboardingTasks();
  const { data: contracts, isLoading: loadingContracts } = useContracts();
  const { data: stats } = useRRHHStats();
  const { data: allDocuments } = useAllDocuments();

  const rrhhDocuments = allDocuments?.filter(d => 
    ['acta', 'capacitacion', 'procedimiento', 'otro'].includes(d.document_type)
  ) || [];

  const filteredEmployees = employees?.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeOnboardingTasks = (employeeId: string) => {
    return onboardingTasks?.filter(t => t.employee_id === employeeId) || [];
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={isMobile ? "pl-0 pt-14" : "pl-64 transition-all duration-300"}>
        <div className="p-6 space-y-6 max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Recursos Humanos</h1>
              <p className="text-muted-foreground">
                Gestión de empleados, contratos y onboarding
              </p>
            </div>
            <div className="flex gap-2">
              <EmployeeForm />
              <ContractForm />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeEmployees || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Onboarding Pendiente</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingOnboarding || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Contratos por Vencer</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.expiringContracts || 0}</div>
                <p className="text-xs text-muted-foreground">Próximos 30 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="employees" className="gap-2">
                <Users className="h-4 w-4" />
                Empleados
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="contracts" className="gap-2">
                <FileSignature className="h-4 w-4" />
                Contratos
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
            </TabsList>

            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nombre, RUT o cargo..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingEmployees ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees?.map(emp => (
                    <EmployeeCard 
                      key={emp.id} 
                      employee={emp}
                      onboardingTasks={getEmployeeOnboardingTasks(emp.id)}
                      onViewDetails={(id) => {
                        const employee = employees?.find(e => e.id === id);
                        if (employee) {
                          setSelectedEmployee(employee);
                          setDetailSheetOpen(true);
                        }
                      }}
                    />
                  ))}
                  {filteredEmployees?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      No se encontraron empleados
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ingreso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees?.map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.rut}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {areaLabels[emp.area] || emp.area}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                              {emp.status === 'active' ? 'Activo' : emp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(emp.date_joined).toLocaleDateString('es-CL')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>

            {/* Onboarding Tab */}
            <TabsContent value="onboarding" className="space-y-4">
              <div className="flex justify-end">
                <OnboardingTaskForm />
              </div>
              <OnboardingList />
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts">
              <Card>
                <CardHeader>
                  <CardTitle>Contratos Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingContracts ? (
                    <Skeleton className="h-48 w-full" />
                  ) : contracts?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileSignature className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay contratos registrados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empleado</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Inicio</TableHead>
                          <TableHead>Término</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts?.map(contract => {
                          const employee = employees?.find(e => e.id === contract.employee_id);
                          return (
                            <TableRow key={contract.id}>
                              <TableCell className="font-medium">
                                {employee?.name || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {contractTypeLabels[contract.contract_type] || contract.contract_type}
                              </TableCell>
                              <TableCell>
                                {new Date(contract.start_date).toLocaleDateString('es-CL')}
                              </TableCell>
                              <TableCell>
                                {contract.end_date 
                                  ? new Date(contract.end_date).toLocaleDateString('es-CL')
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>
                                <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                                  {contract.status === 'active' ? 'Vigente' : contract.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos del Área
                  </CardTitle>
                  <DocumentUploadDialog 
                    trigger={
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4 rotate-180" />
                        Subir Documento
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent>
                  {rrhhDocuments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay documentos disponibles</p>
                      <p className="text-sm mt-1">Usa el botón "Subir Documento" para agregar archivos del área</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Versión</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Descargar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rrhhDocuments.map(doc => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.title}</TableCell>
                            <TableCell className="capitalize">{doc.document_type}</TableCell>
                            <TableCell>v{doc.version}</TableCell>
                            <TableCell>
                              <Badge variant={doc.is_active ? 'default' : 'secondary'}>
                                {doc.is_active ? 'Vigente' : 'Obsoleto'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
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
          </Tabs>
        </div>

        <EmployeeDetailSheet 
          employee={selectedEmployee} 
          open={detailSheetOpen} 
          onOpenChange={setDetailSheetOpen} 
        />
      </main>
    </div>
  );
}
