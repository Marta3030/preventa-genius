import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIntegralKPIs } from "@/hooks/useIntegralModule";
import { usePreventionKPIs } from "@/hooks/usePrevention";
import { EPPDashboard } from "./EPPDashboard";
import { UnifiedActionsKanban } from "./UnifiedActionsKanban";
import { 
  HardHat, 
  FileSignature, 
  ClipboardCheck, 
  Target,
  Leaf,
  Award,
  AlertTriangle,
  TrendingUp,
  Users,
  Shield
} from "lucide-react";

export function IntegralDashboard() {
  const integralKPIs = useIntegralKPIs();
  const { data: preventionKPIs } = usePreventionKPIs();

  return (
    <div className="space-y-6">
      {/* Header KPIs - ISO Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ISO 45001 - SST */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ISO 45001 - Seguridad y Salud
              </CardDescription>
              <Badge variant="outline" className="bg-primary/10 text-primary">SST</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold">{preventionKPIs?.tf?.toFixed(2) || 0}</p>
                <p className="text-xs text-muted-foreground">TF</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{preventionKPIs?.tgr?.toFixed(2) || 0}</p>
                <p className="text-xs text-muted-foreground">TGR</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{preventionKPIs?.days_lost || 0}</p>
                <p className="text-xs text-muted-foreground">Días Perdidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ISO 14001 - Medio Ambiente */}
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                ISO 14001 - Medio Ambiente
              </CardDescription>
              <Badge variant="outline" className="bg-success/10 text-success">MA</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-warning">{integralKPIs.environmental.incidents_open}</p>
                <p className="text-xs text-muted-foreground">Incidentes Abiertos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">No Conformidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ISO 9001 - Calidad */}
        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                ISO 9001 - Calidad
              </CardDescription>
              <Badge variant="outline" className="bg-info/10 text-info">QMS</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-warning">{integralKPIs.quality.ncs_open}</p>
                <p className="text-xs text-muted-foreground">NC Abiertas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Acciones Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HardHat className="h-4 w-4" />
              EPP Pendientes Firma
            </CardDescription>
            <CardTitle className="text-2xl">{integralKPIs.epp.pending_signature}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              DAS Pendientes
            </CardDescription>
            <CardTitle className="text-2xl">{integralKPIs.das.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Acciones Pendientes
            </CardDescription>
            <CardTitle className="text-2xl">{integralKPIs.actions.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Acciones Vencidas
            </CardDescription>
            <CardTitle className="text-2xl text-destructive">{integralKPIs.actions.overdue}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for different modules */}
      <Tabs defaultValue="epp" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="epp" className="gap-2">
            <HardHat className="h-4 w-4" />
            <span className="hidden sm:inline">EPP</span>
          </TabsTrigger>
          <TabsTrigger value="das" className="gap-2">
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">DAS</span>
          </TabsTrigger>
          <TabsTrigger value="inspections" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Inspecciones</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Acciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epp">
          <EPPDashboard />
        </TabsContent>

        <TabsContent value="das">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-primary" />
                    Derecho a Saber (DAS)
                  </CardTitle>
                  <CardDescription>
                    Gestión de documentos de información sobre riesgos laborales
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold">{integralKPIs.das.total}</p>
                  <p className="text-sm text-muted-foreground">Total Documentos</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-warning">{integralKPIs.das.pending}</p>
                  <p className="text-sm text-muted-foreground">Pendientes Firma</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-success">{integralKPIs.das.signed}</p>
                  <p className="text-sm text-muted-foreground">Firmados</p>
                </div>
              </div>
              <p className="text-center text-muted-foreground py-8">
                Sistema de gestión de Derecho a Saber (DAS) - Próximamente: generación automática desde IPER
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Inspecciones y Checklists
              </CardTitle>
              <CardDescription>
                Plantillas configurables para inspecciones de seguridad, ambiente y calidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-3xl font-bold">{preventionKPIs?.inspections_done || 0}</p>
                  <p className="text-sm text-muted-foreground">Inspecciones Realizadas</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-3xl font-bold">{preventionKPIs?.inspections_planned || 0}</p>
                  <p className="text-sm text-muted-foreground">Inspecciones Planificadas</p>
                </div>
              </div>
              <p className="text-center text-muted-foreground py-8">
                Sistema de inspecciones móviles con soporte offline - Próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <UnifiedActionsKanban />
        </TabsContent>
      </Tabs>
    </div>
  );
}
