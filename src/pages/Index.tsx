import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceGauge } from "@/components/dashboard/ComplianceGauge";
import { RiskMatrix } from "@/components/dashboard/RiskMatrix";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { RIOHSCard } from "@/components/dashboard/RIOHSCard";
import { AreaStatusGrid } from "@/components/dashboard/AreaStatusGrid";
import { AccidentTrendChart } from "@/components/dashboard/AccidentTrendChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { usePreventionKPIs, useIncidents, useCorrectiveActions } from "@/hooks/usePrevention";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import jsPDF from "jspdf";
import {
  HardHat,
  AlertTriangle,
  Clock,
  FileCheck,
  TrendingDown,
  Activity,
  Download,
  Calendar,
  Search,
  Bell,
} from "lucide-react";
import { differenceInDays, startOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const Index = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: kpis, isLoading: isLoadingKPIs } = usePreventionKPIs();
  const { data: incidents } = useIncidents();
  const { data: correctiveActions } = useCorrectiveActions();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate days without accidents
  const lastAccident = incidents?.find(i => i.severity === 'grave' || i.severity === 'catastrofico');
  const daysSinceAccident = lastAccident 
    ? differenceInDays(new Date(), new Date(lastAccident.incident_date))
    : 365;

  // Calculate overdue actions
  const overdueActions = correctiveActions?.filter(
    a => a.status === 'pending' && new Date(a.due_date) < startOfDay(new Date())
  ).length || 0;

  // Calculate compliance scores
  const sstCompliance = kpis ? Math.round(
    (100 - (kpis.tf * 5)) * 0.4 + 
    kpis.training_compliance * 0.3 + 
    kpis.inspections_compliance * 0.3
  ) : 87;

  const legalCompliance = kpis ? Math.round(kpis.training_compliance) : 92;
  const isoCompliance = kpis ? Math.round(kpis.inspections_compliance) : 85;

  const handleExport = () => {
    try {
      exportDashboardPDF({
        title: 'Informe Ejecutivo SST',
        date: format(new Date(), "dd/MM/yyyy"),
        kpis: {
          sstCompliance,
          legalCompliance,
          isoCompliance,
          tf: kpis?.tf || 0,
          tgr: kpis?.tgr || 0,
          daysSinceAccident,
          openIncidents: kpis?.open_incidents || 0,
          overdueActions,
          totalWorkers: kpis?.total_workers || 0,
          trainingCompliance: kpis?.training_compliance || 0,
          inspectionsDone: kpis?.inspections_done || 0,
          inspectionsPlanned: kpis?.inspections_planned || 0,
        },
      });
      toast.success('Informe exportado correctamente');
    } catch {
      toast.error('Error al exportar');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className={cn("transition-all duration-300", isMobile ? "pl-0 pt-14" : "pl-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-2">
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">
                Dashboard Ejecutivo
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Tablero de Cumplimiento SST • ISO 45001
              </p>
            </div>

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {/* Search - hidden on mobile, popover on desktop */}
              {!isMobile && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 lg:w-64"
                  />
                </div>
              )}

              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/alertas')}>
                <Bell className="h-5 w-5" />
                {kpis && kpis.open_incidents > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {kpis.open_incidents}
                  </span>
                )}
              </Button>

              {/* Calendar */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size={isMobile ? "icon" : "sm"}>
                    <Calendar className="h-4 w-4" />
                    {!isMobile && <span className="ml-2">{format(selectedDate || new Date(), "MMM yyyy", { locale: es })}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarWidget
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Export */}
              <Button variant="outline" size={isMobile ? "icon" : "sm"} onClick={handleExport}>
                <Download className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Exportar</span>}
              </Button>

              <UserMenu />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Global Compliance Banner */}
          <div className="safety-gradient rounded-2xl p-4 md:p-6 text-primary-foreground">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 md:p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <HardHat className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <div>
                  {isLoadingKPIs ? (
                    <>
                      <Skeleton className="h-9 w-20 bg-primary-foreground/20 mb-1" />
                      <Skeleton className="h-5 w-40 bg-primary-foreground/20" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl md:text-3xl font-bold">{sstCompliance}%</h2>
                      <p className="text-base md:text-lg font-medium opacity-90">
                        Cumplimiento Global SST
                      </p>
                    </>
                  )}
                  <p className="text-xs md:text-sm opacity-75">
                    ISO 45001 • Normativa Chilena • Ley 16.744
                  </p>
                </div>
              </div>

              <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-around md:justify-end">
                <div className="text-center">
                  {isLoadingKPIs ? (
                    <Skeleton className="h-10 w-16 bg-primary-foreground/20 mb-1" />
                  ) : (
                    <div className="text-2xl md:text-4xl font-bold">{legalCompliance}%</div>
                  )}
                  <div className="text-xs md:text-sm opacity-75">Legal</div>
                </div>
                <div className="text-center">
                  {isLoadingKPIs ? (
                    <Skeleton className="h-10 w-16 bg-primary-foreground/20 mb-1" />
                  ) : (
                    <div className="text-2xl md:text-4xl font-bold">{isoCompliance}%</div>
                  )}
                  <div className="text-xs md:text-sm opacity-75">ISO</div>
                </div>
                <div className="text-center">
                  {isLoadingKPIs ? (
                    <Skeleton className="h-10 w-16 bg-primary-foreground/20 mb-1" />
                  ) : (
                    <div className="text-2xl md:text-4xl font-bold">{kpis?.total_workers || 0}</div>
                  )}
                  <div className="text-xs md:text-sm opacity-75">Trabajadores</div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <MetricCard
              title="Tasa Frecuencia"
              value={isLoadingKPIs ? "..." : (kpis?.tf?.toString() || "0")}
              icon={Activity}
              status={!kpis ? "neutral" : kpis.tf < 2 ? "success" : kpis.tf < 5 ? "warning" : "danger"}
              trend={{ value: -15, label: "vs mes anterior" }}
            />
            <MetricCard
              title="Días sin Accidentes"
              value={daysSinceAccident.toString()}
              icon={TrendingDown}
              status={daysSinceAccident > 30 ? "success" : "warning"}
              subtitle="Grave/Catastrófico"
            />
            <MetricCard
              title="Incidentes Abiertos"
              value={isLoadingKPIs ? "..." : (kpis?.open_incidents?.toString() || "0")}
              icon={AlertTriangle}
              status={!kpis ? "neutral" : kpis.open_incidents === 0 ? "success" : kpis.open_incidents < 5 ? "warning" : "danger"}
            />
            <MetricCard
              title="Acciones Vencidas"
              value={overdueActions.toString()}
              icon={Clock}
              status={overdueActions === 0 ? "success" : "danger"}
              subtitle={overdueActions > 0 ? "Requiere atención" : "Al día"}
            />
            <MetricCard
              title="Inspecciones"
              value={isLoadingKPIs ? "..." : `${kpis?.inspections_compliance || 0}%`}
              icon={FileCheck}
              status={!kpis ? "neutral" : kpis.inspections_compliance >= 90 ? "success" : kpis.inspections_compliance >= 70 ? "warning" : "danger"}
              subtitle={`${kpis?.inspections_done || 0}/${kpis?.inspections_planned || 0}`}
            />
            <MetricCard
              title="Capacitaciones"
              value={isLoadingKPIs ? "..." : `${kpis?.training_compliance || 0}%`}
              icon={HardHat}
              status={!kpis ? "neutral" : kpis.training_compliance >= 95 ? "success" : kpis.training_compliance >= 80 ? "warning" : "danger"}
              subtitle="Legal vigente"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <RIOHSCard />
              <AlertsList />
            </div>

            {/* Center Column */}
            <div className="lg:col-span-5 space-y-4 md:space-y-6">
              <RiskMatrix />
              <AccidentTrendChart />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <div className="bg-card rounded-xl border border-border p-4 md:p-5 space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground mb-4">
                  Indicadores de Cumplimiento
                </h3>
                <ComplianceGauge label="Cumplimiento SST" value={sstCompliance} />
                <ComplianceGauge label="Cumplimiento Legal" value={legalCompliance} />
                <ComplianceGauge label="Cumplimiento ISO" value={isoCompliance} />
                <ComplianceGauge 
                  label="Capacitaciones" 
                  value={Math.round(kpis?.training_compliance || 89)} 
                />
                <ComplianceGauge 
                  label="Inspecciones" 
                  value={Math.round(kpis?.inspections_compliance || 94)} 
                />
                <ComplianceGauge 
                  label="Documentación" 
                  value={78} 
                  status="warning" 
                />
              </div>

              <AreaStatusGrid />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default Index;
