import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useRunComplianceScan, buildPHVACycle, type ComplianceCheckResult, type PHVACycle } from '@/hooks/useComplianceEngine';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, MinusCircle,
  RotateCcw, Hammer, ClipboardCheck, TrendingUp,
} from 'lucide-react';

const phvaIcons = {
  planificar: RotateCcw,
  hacer: Hammer,
  verificar: ClipboardCheck,
  actuar: TrendingUp,
};

const phvaColors = {
  planificar: 'from-blue-500 to-blue-600',
  hacer: 'from-emerald-500 to-emerald-600',
  verificar: 'from-amber-500 to-amber-600',
  actuar: 'from-purple-500 to-purple-600',
};

const statusConfig = {
  compliant: { icon: CheckCircle2, label: 'Cumple', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  non_compliant: { icon: XCircle, label: 'No Cumple', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  partial: { icon: AlertTriangle, label: 'Parcial', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  not_applicable: { icon: MinusCircle, label: 'N/A', color: 'text-muted-foreground', bg: 'bg-muted/30' },
};

const categoryLabels: Record<string, string> = {
  ds44: 'DS 44',
  ley_16744: 'Ley 16.744',
  oit_155: 'OIT 155',
  iso_45001: 'ISO 45001',
};

export function ComplianceDashboard() {
  const runScan = useRunComplianceScan();
  const [results, setResults] = useState<ComplianceCheckResult[] | null>(null);
  const [phvaCycle, setPHVACycle] = useState<PHVACycle[] | null>(null);

  const handleScan = async () => {
    try {
      const scanResults = await runScan.mutateAsync();
      setResults(scanResults);
      setPHVACycle(buildPHVACycle(scanResults));
      toast.success('Escaneo de cumplimiento completado');
    } catch {
      toast.error('Error al ejecutar el escaneo');
    }
  };

  const overallCompliance = results
    ? Math.round(
        (results.filter(r => r.status === 'compliant').length +
          results.filter(r => r.status === 'partial').length * 0.5) /
          results.filter(r => r.status !== 'not_applicable').length * 100
      )
    : null;

  const criticalIssues = results?.filter(r => r.status === 'non_compliant' && r.severity === 'critical').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Motor de Cumplimiento Legal
          </h2>
          <p className="text-sm text-muted-foreground">
            DS44 • Ley 16.744 • Convenio 155 OIT • ISO 45001
          </p>
        </div>
        <Button onClick={handleScan} disabled={runScan.isPending}>
          {runScan.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4 mr-2" />
          )}
          Ejecutar Escaneo
        </Button>
      </div>

      {/* Overall Score */}
      {overallCompliance !== null && (
        <Card className={criticalIssues > 0 ? 'border-destructive/50' : 'border-emerald-500/50'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {criticalIssues > 0 ? (
                  <div className="p-3 rounded-full bg-destructive/10">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                  </div>
                )}
                <div>
                  <div className="text-4xl font-bold">{overallCompliance}%</div>
                  <p className="text-muted-foreground">Cumplimiento Legal General</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {results?.filter(r => r.status === 'compliant').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Cumple</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {results?.filter(r => r.status === 'partial').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Parcial</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">
                    {results?.filter(r => r.status === 'non_compliant').length}
                  </div>
                  <div className="text-xs text-muted-foreground">No Cumple</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PHVA Cycle */}
      {phvaCycle && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {phvaCycle.map((phase) => {
            const Icon = phvaIcons[phase.phase];
            return (
              <Card key={phase.phase} className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${phvaColors[phase.phase]}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {phase.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold">{phase.compliance}%</span>
                    <Progress value={phase.compliance} className="flex-1 h-2" />
                  </div>
                  <div className="space-y-1.5">
                    {phase.checks.map((check) => {
                      const cfg = statusConfig[check.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={check.rule_code} className={`flex items-center gap-2 text-xs p-1.5 rounded ${cfg.bg}`}>
                          <StatusIcon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
                          <span className="truncate">{check.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Cumplimiento por Requisito Legal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => {
                const cfg = statusConfig[result.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={result.rule_code} className={`p-4 rounded-lg border ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <StatusIcon className={`h-5 w-5 mt-0.5 ${cfg.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{result.title}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {categoryLabels[result.category] || result.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {result.legal_reference}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.details}</p>
                          {result.total !== undefined && result.count !== undefined && (
                            <Progress 
                              value={(result.count / result.total) * 100} 
                              className="mt-2 h-1.5 max-w-xs" 
                            />
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={result.status === 'compliant' ? 'default' : result.status === 'non_compliant' ? 'destructive' : 'secondary'}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!results && (
        <Card className="py-16">
          <CardContent className="text-center">
            <ShieldX className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">Sin datos de cumplimiento</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ejecute un escaneo para evaluar el cumplimiento de su organización contra DS44, 
              Ley 16.744, Convenio 155 OIT e ISO 45001.
            </p>
            <Button onClick={handleScan} disabled={runScan.isPending} size="lg">
              <ShieldCheck className="h-5 w-5 mr-2" />
              Ejecutar Primer Escaneo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
