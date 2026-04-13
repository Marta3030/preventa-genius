import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAllAlerts, useRestoreAlert, useDismissAlert } from "@/hooks/usePrevention";
import { useRunAlertScan, useAlertStats } from "@/hooks/useAlertEngine";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Heart, 
  Stethoscope, 
  FileWarning,
  X,
  RotateCcw,
  Filter,
  Search,
  CheckCircle2,
  RefreshCw,
  Bell,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const typeStyles = {
  critical: {
    bg: "bg-destructive/5 border-destructive/20",
    icon: "bg-destructive/10 text-destructive",
    badge: "bg-destructive text-destructive-foreground",
  },
  warning: {
    bg: "bg-warning/5 border-warning/20",
    icon: "bg-warning/10 text-warning",
    badge: "bg-warning text-warning-foreground",
  },
  info: {
    bg: "bg-info/5 border-info/20",
    icon: "bg-info/10 text-info",
    badge: "bg-info text-info-foreground",
  },
};

const severityToType = (severity: string): "critical" | "warning" | "info" => {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
};

const getAlertIcon = (entityType?: string, severity?: string): React.ElementType => {
  if (entityType === 'employee_health') {
    return severity === 'critical' || severity === 'error' ? Heart : Stethoscope;
  }
  if (severity === 'critical' || severity === 'error') {
    return ShieldAlert;
  }
  if (entityType === 'contract' || entityType === 'onboarding') {
    return FileWarning;
  }
  return AlertTriangle;
};

const getModuleName = (entityType?: string): string => {
  switch (entityType) {
    case 'employee_health':
      return 'Salud Ocupacional';
    case 'incident':
      return 'Prevención';
    case 'contract':
      return 'RRHH';
    case 'onboarding':
      return 'Onboarding';
    default:
      return 'Sistema';
  }
};

export default function Alerts() {
  const { user, isAdmin } = useAuth();
  const { data: alerts, isLoading } = useAllAlerts();
  const { data: alertStats } = useAlertStats();
  const dismissAlert = useDismissAlert();
  const restoreAlert = useRestoreAlert();
  const runAlertScan = useRunAlertScan();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // Separate active and dismissed alerts
  const activeAlerts = alerts?.filter(
    alert => !alert.dismissed_by?.includes(user?.id || '')
  ) || [];
  
  const dismissedAlerts = alerts?.filter(
    alert => alert.dismissed_by?.includes(user?.id || '')
  ) || [];

  // Apply filters
  const filterAlerts = (alertsList: typeof alerts) => {
    if (!alertsList) return [];
    
    return alertsList.filter(alert => {
      const matchesSearch = 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = 
        severityFilter === "all" || 
        severityToType(alert.severity) === severityFilter;
      
      const matchesModule = 
        moduleFilter === "all" || 
        getModuleName(alert.entity_type) === moduleFilter;
      
      return matchesSearch && matchesSeverity && matchesModule;
    });
  };

  const filteredActive = filterAlerts(activeAlerts);
  const filteredDismissed = filterAlerts(dismissedAlerts);

  // Get unique modules for filter
  const modules = [...new Set(alerts?.map(a => getModuleName(a.entity_type)) || [])];

  const handleDismiss = (alertId: string) => {
    dismissAlert.mutate(alertId);
  };

  const handleRestore = (alertId: string) => {
    restoreAlert.mutate(alertId);
  };

  const renderAlertCard = (alert: NonNullable<typeof alerts>[0], showRestore: boolean = false) => {
    const type = severityToType(alert.severity);
    const Icon = getAlertIcon(alert.entity_type, alert.severity);
    const styles = typeStyles[type];
    const module = getModuleName(alert.entity_type);
    const isDismissed = alert.dismissed_by?.includes(user?.id || '');

    return (
      <div
        key={alert.id}
        className={cn(
          "flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md group",
          styles.bg,
          isDismissed && "opacity-60"
        )}
      >
        <div className={cn("p-3 rounded-lg flex-shrink-0", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">
              {alert.title}
            </h4>
            <Badge variant="outline" className={cn("text-[10px]", styles.badge)}>
              {type === "critical" ? "Crítico" : type === "warning" ? "Alerta" : "Info"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {alert.message}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">{module}</span>
            <span>•</span>
            <span>{format(parseISO(alert.created_at), "dd MMM yyyy, HH:mm", { locale: es })}</span>
            <span>•</span>
            <span>{formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true, locale: es })}</span>
            {alert.expires_at && (
              <>
                <span>•</span>
                <span className="text-warning">
                  Expira: {format(parseISO(alert.expires_at), "dd MMM yyyy", { locale: es })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {showRestore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(alert.id)}
              disabled={restoreAlert.isPending}
              className="gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDismiss(alert.id)}
              disabled={dismissAlert.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={isMobile ? "pl-0 pt-14" : "pl-64 transition-all duration-300"}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Centro de Alertas</h1>
              <p className="text-sm text-muted-foreground">
                Motor de alertas con escalamiento automático a Gerencia
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button 
                  onClick={() => runAlertScan.mutate()}
                  disabled={runAlertScan.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", runAlertScan.isPending && "animate-spin")} />
                  Escanear Ahora
                </Button>
              )}
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Críticas</SelectItem>
                  <SelectItem value="warning">Alertas</SelectItem>
                  <SelectItem value="info">Informativas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAlerts.filter(a => severityToType(a.severity) === 'critical').length}</p>
                  <p className="text-xs text-muted-foreground">Críticas</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAlerts.filter(a => severityToType(a.severity) === 'warning').length}</p>
                  <p className="text-xs text-muted-foreground">Alertas</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Stethoscope className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAlerts.filter(a => severityToType(a.severity) === 'info').length}</p>
                  <p className="text-xs text-muted-foreground">Informativas</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dismissedAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Descartadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                Activas
                <Badge variant="secondary" className="ml-1">{filteredActive.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="gap-2">
                Descartadas
                <Badge variant="secondary" className="ml-1">{filteredDismissed.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                Historial
                <Badge variant="secondary" className="ml-1">{(alerts?.length || 0)}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))
              ) : filteredActive.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">Sin alertas activas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No hay alertas que requieran tu atención
                  </p>
                </div>
              ) : (
                filteredActive.map(alert => renderAlertCard(alert, false))
              )}
            </TabsContent>

            <TabsContent value="dismissed" className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))
              ) : filteredDismissed.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">Sin alertas descartadas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Las alertas que descartes aparecerán aquí
                  </p>
                </div>
              ) : (
                filteredDismissed.map(alert => renderAlertCard(alert, true))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))
              ) : filterAlerts(alerts).length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">Sin alertas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No hay alertas registradas en el sistema
                  </p>
                </div>
              ) : (
                filterAlerts(alerts).map(alert => renderAlertCard(alert, alert.dismissed_by?.includes(user?.id || '')))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}