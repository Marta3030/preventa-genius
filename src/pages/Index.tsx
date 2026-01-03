import { Sidebar } from "@/components/layout/Sidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceGauge } from "@/components/dashboard/ComplianceGauge";
import { RiskMatrix } from "@/components/dashboard/RiskMatrix";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { RIOHSCard } from "@/components/dashboard/RIOHSCard";
import { AreaStatusGrid } from "@/components/dashboard/AreaStatusGrid";
import { AccidentTrendChart } from "@/components/dashboard/AccidentTrendChart";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  AlertTriangle,
  Clock,
  FileCheck,
  TrendingDown,
  Activity,
  Plus,
  Download,
  Calendar,
  Search,
  Bell,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="pl-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard Ejecutivo
              </h1>
              <p className="text-sm text-muted-foreground">
                Tablero de Cumplimiento SST • ISO 45001
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
                />
              </div>

              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  5
                </span>
              </Button>

              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Enero 2025
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button size="sm" className="shadow-safety">
                <Plus className="h-4 w-4 mr-2" />
                Reportar Incidente
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Global Compliance Banner */}
          <div className="safety-gradient rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <HardHat className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">87%</h2>
                  <p className="text-lg font-medium opacity-90">
                    Cumplimiento Global SST
                  </p>
                  <p className="text-sm opacity-75">
                    ISO 45001 • Normativa Chilena • Ley 16.744
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">92%</div>
                  <div className="text-sm opacity-75">Cumplimiento Legal</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">85%</div>
                  <div className="text-sm opacity-75">Cumplimiento ISO</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">84%</div>
                  <div className="text-sm opacity-75">Gestión de Riesgos</div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Tasa Frecuencia"
              value="0.8"
              icon={Activity}
              status="success"
              trend={{ value: -15, label: "vs mes anterior" }}
            />
            <MetricCard
              title="Días sin Accidentes"
              value="127"
              icon={TrendingDown}
              status="success"
              subtitle="Récord: 180 días"
            />
            <MetricCard
              title="Incidentes Abiertos"
              value="3"
              icon={AlertTriangle}
              status="warning"
              trend={{ value: 12, label: "vs mes anterior" }}
            />
            <MetricCard
              title="Acciones Vencidas"
              value="8"
              icon={Clock}
              status="danger"
              subtitle="Requiere atención"
            />
            <MetricCard
              title="Inspecciones"
              value="94%"
              icon={FileCheck}
              status="success"
              trend={{ value: 5, label: "cumplimiento" }}
            />
            <MetricCard
              title="Capacitaciones"
              value="89%"
              icon={HardHat}
              status="success"
              subtitle="Legal vigente"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - 4 cols */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <RIOHSCard />
              <AlertsList />
            </div>

            {/* Center Column - 5 cols */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <RiskMatrix />
              <AccidentTrendChart />
            </div>

            {/* Right Column - 3 cols */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Compliance Gauges */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4 animate-fade-in">
                <h3 className="font-semibold text-foreground mb-4">
                  Indicadores de Cumplimiento
                </h3>
                <ComplianceGauge label="Cumplimiento SST" value={87} />
                <ComplianceGauge label="Cumplimiento Legal" value={92} />
                <ComplianceGauge label="Cumplimiento ISO" value={85} />
                <ComplianceGauge label="Capacitaciones" value={89} />
                <ComplianceGauge label="Inspecciones" value={94} />
                <ComplianceGauge label="Documentación" value={78} status="warning" />
              </div>

              <AreaStatusGrid />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "Reglamento Interno", icon: FileCheck },
                { label: "Informe Gerencial", icon: Download },
                { label: "Matriz de Riesgos", icon: AlertTriangle },
                { label: "Actas Comité", icon: Calendar },
                { label: "Nueva Inspección", icon: Plus },
                { label: "Reportar Incidente", icon: AlertTriangle },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
