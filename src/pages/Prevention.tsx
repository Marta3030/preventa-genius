import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncidents, useRisks, useTrainings, useInspections, useCorrectiveActions } from "@/hooks/usePrevention";
import { IncidentForm } from "@/components/prevention/IncidentForm";
import { TrainingForm } from "@/components/prevention/TrainingForm";
import { InspectionForm } from "@/components/prevention/InspectionForm";
import { CorrectiveActionForm } from "@/components/prevention/CorrectiveActionForm";
import { RiskForm } from "@/components/prevention/RiskForm";
import { RIOHSCard } from "@/components/dashboard/RIOHSCard";
import { RIOHSUploadDialog } from "@/components/prevention/RIOHSUploadDialog";
import { RiskMatrix } from "@/components/dashboard/RiskMatrix";
import { IntegralDashboard } from "@/components/integral/IntegralDashboard";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Layers,
  Globe,
} from "lucide-react";

const severityColors: Record<string, string> = {
  leve: "bg-success/10 text-success border-success/30",
  moderado: "bg-warning/10 text-warning border-warning/30",
  grave: "bg-destructive/10 text-destructive border-destructive/30",
  catastrofico: "bg-destructive text-destructive-foreground",
};

const statusColors: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_investigacion: "bg-warning/10 text-warning border-warning/30",
  cerrado: "bg-success/10 text-success border-success/30",
  completado: "bg-success/10 text-success border-success/30",
  completada: "bg-success/10 text-success border-success/30",
  open: "bg-warning/10 text-warning",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};

const riskLevelColors: Record<string, string> = {
  bajo: "bg-success/10 text-success border-success/30",
  medio: "bg-primary/10 text-primary border-primary/30",
  alto: "bg-warning/10 text-warning border-warning/30",
  critico: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function Prevention() {
  const { } = useAuth();
  const { data: incidents, isLoading: loadingIncidents } = useIncidents();
  const { data: risks, isLoading: loadingRisks } = useRisks();
  const { data: trainings, isLoading: loadingTrainings } = useTrainings();
  const { data: inspections, isLoading: loadingInspections } = useInspections();
  const { data: correctiveActions, isLoading: loadingActions } = useCorrectiveActions();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-7 w-7 text-primary" />
                Prevención de Riesgos
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión integral de SST • IPER • Capacitaciones • Incidentes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <RiskForm />
              <IncidentForm />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="incidents" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-6">
              <TabsTrigger value="integral" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Integral
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Incidentes
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Riesgos
              </TabsTrigger>
              <TabsTrigger value="trainings" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Capacitaciones
              </TabsTrigger>
              <TabsTrigger value="inspections" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Inspecciones
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                RIOHS
              </TabsTrigger>
            </TabsList>

            {/* MÓDULO INTEGRAL */}
            <TabsContent value="integral">
              <IntegralDashboard />
            </TabsContent>

            {/* INCIDENTES */}
            <TabsContent value="incidents" className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Incidentes</CardDescription>
                    <CardTitle className="text-3xl">{incidents?.length || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Abiertos</CardDescription>
                    <CardTitle className="text-3xl text-warning">
                      {incidents?.filter(i => i.investigation_status !== 'cerrado').length || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Graves/Catastróficos</CardDescription>
                    <CardTitle className="text-3xl text-destructive">
                      {incidents?.filter(i => i.severity === 'grave' || i.severity === 'catastrofico').length || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Días Perdidos</CardDescription>
                    <CardTitle className="text-3xl">
                      {incidents?.reduce((acc, i) => acc + (i.days_lost || 0), 0) || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Registro de Incidentes</CardTitle>
                    <IncidentForm />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingIncidents ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : incidents?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay incidentes registrados</p>
                      <IncidentForm 
                        trigger={
                          <Button variant="outline" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Reportar primer incidente
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Severidad</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Días Perdidos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents?.map((incident) => (
                          <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              {format(parseISO(incident.incident_date), "dd/MM/yyyy", { locale: es })}
                            </TableCell>
                            <TableCell className="font-medium">{incident.title}</TableCell>
                            <TableCell className="capitalize">{incident.area.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={severityColors[incident.severity]}>
                                {incident.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[incident.investigation_status || 'pendiente']}>
                                {incident.investigation_status || 'Pendiente'}
                              </Badge>
                            </TableCell>
                            <TableCell>{incident.days_lost || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Acciones Correctivas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Acciones Correctivas (CAPA)</CardTitle>
                      <CardDescription>Seguimiento de acciones derivadas de incidentes</CardDescription>
                    </div>
                    <CorrectiveActionForm />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingActions ? (
                    <Skeleton className="h-32 w-full" />
                  ) : correctiveActions?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No hay acciones correctivas pendientes
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Acción</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha Límite</TableHead>
                          <TableHead>Prioridad</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {correctiveActions?.slice(0, 5).map((action) => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium">{action.title}</TableCell>
                            <TableCell className="capitalize">{action.action_type}</TableCell>
                            <TableCell>
                              {format(parseISO(action.due_date), "dd/MM/yyyy", { locale: es })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                action.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                                action.priority === 'high' ? 'bg-warning/10 text-warning' :
                                'bg-muted text-muted-foreground'
                              }>
                                {action.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[action.status]}>
                                {action.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RIESGOS */}
            <TabsContent value="risks" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <RiskMatrix />
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Riesgos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-2xl font-bold text-destructive">
                          {risks?.filter(r => r.residual_risk === 'critico').length || 0}
                        </p>
                        <p className="text-sm text-destructive/80">Críticos</p>
                      </div>
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-2xl font-bold text-warning">
                          {risks?.filter(r => r.residual_risk === 'alto').length || 0}
                        </p>
                        <p className="text-sm text-warning/80">Altos</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-2xl font-bold text-primary">
                          {risks?.filter(r => r.residual_risk === 'medio').length || 0}
                        </p>
                        <p className="text-sm text-primary/80">Medios</p>
                      </div>
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-2xl font-bold text-success">
                          {risks?.filter(r => r.residual_risk === 'bajo').length || 0}
                        </p>
                        <p className="text-sm text-success/80">Bajos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Listado de Riesgos Identificados</CardTitle>
                    <RiskForm />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingRisks ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : risks?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay riesgos identificados en la matriz IPER</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Peligro</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Prob.</TableHead>
                          <TableHead>Sev.</TableHead>
                          <TableHead>Nivel</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {risks?.map((risk) => (
                          <TableRow key={risk.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{risk.title}</TableCell>
                            <TableCell className="capitalize">{risk.area.replace('_', ' ')}</TableCell>
                            <TableCell>{risk.probability}</TableCell>
                            <TableCell>{risk.severity}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={riskLevelColors[risk.residual_risk]}>
                                {risk.residual_risk}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{risk.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CAPACITACIONES */}
            <TabsContent value="trainings" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Capacitaciones SST</CardTitle>
                      <CardDescription>Programas de formación y cumplimiento legal</CardDescription>
                    </div>
                    
                    <TrainingForm />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingTrainings ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : trainings?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay capacitaciones registradas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Duración</TableHead>
                          <TableHead>Vigencia</TableHead>
                          <TableHead>Requisito Legal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainings?.map((training) => (
                          <TableRow key={training.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{training.title}</TableCell>
                            <TableCell className="capitalize">{training.type || 'company'}</TableCell>
                            <TableCell>{training.duration_hours ? `${training.duration_hours}h` : '-'}</TableCell>
                            <TableCell>{training.expiry_months ? `${training.expiry_months} meses` : 'Permanente'}</TableCell>
                            <TableCell>
                              {training.is_legal_requirement ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground" />
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

            {/* INSPECCIONES */}
            <TabsContent value="inspections" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inspecciones de Seguridad</CardTitle>
                      <CardDescription>Programa de inspecciones y hallazgos</CardDescription>
                    </div>
                    <InspectionForm />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingInspections ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : inspections?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay inspecciones programadas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha Planificada</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Hallazgos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inspections?.map((inspection) => (
                          <TableRow key={inspection.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              {format(parseISO(inspection.planned_date), "dd/MM/yyyy", { locale: es })}
                            </TableCell>
                            <TableCell className="font-medium">{inspection.title}</TableCell>
                            <TableCell className="capitalize">{inspection.area.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[inspection.status] || 'bg-muted'}>
                                {inspection.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{inspection.findings_count || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RIOHS */}
            <TabsContent value="documents" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <RIOHSCard />
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Gestión RIOHS</CardTitle>
                        <CardDescription>Reglamento Interno de Orden, Higiene y Seguridad</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <RIOHSUploadDialog />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                      <h4 className="font-medium text-info mb-2">Obligación Legal</h4>
                      <p className="text-sm text-info/80">
                        Según el Art. 153 del Código del Trabajo, toda empresa con 10 o más 
                        trabajadores debe contar con un Reglamento Interno registrado en la 
                        Inspección del Trabajo y SEREMI de Salud.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Contenido obligatorio:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Normas de prevención, higiene y seguridad</li>
                        <li>Obligaciones y prohibiciones de los trabajadores</li>
                        <li>Sanciones por infracciones</li>
                        <li>Procedimiento de reclamos</li>
                        <li>Política de alcohol y drogas</li>
                      </ul>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Registros requeridos:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Registro ante la Inspección del Trabajo (DT)</li>
                        <li>Registro ante la SEREMI de Salud</li>
                        <li>Acuse de recibo de todos los trabajadores</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registro SEREMI de Salud */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Registro SEREMI de Salud
                  </CardTitle>
                  <CardDescription>
                    Estado del registro ante la Secretaría Regional Ministerial de Salud
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <div>
                        <p className="font-medium">Registro SEREMI vigente</p>
                        <p className="text-sm text-muted-foreground">
                          Resolución N° 12345 - Vence: 31/12/2026
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver documento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
