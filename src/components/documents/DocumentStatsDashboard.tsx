import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { FileCheck, FileX, Clock, FileText, Users, TrendingUp, Download, Loader2 } from "lucide-react";
import { exportSignatureStatsPDF } from "@/lib/pdfExporter";

interface SignatureStats {
  total: number;
  signed: number;
  pending: number;
  byArea: { area: string; signed: number; pending: number }[];
  byMonth: { month: string; signed: number; pending: number }[];
  byDocument: { title: string; signed: number; pending: number; total: number }[];
}

const areaLabels: Record<string, string> = {
  gerencia: "Gerencia",
  rrhh: "RRHH",
  reclutamiento: "Reclutamiento",
  prevencion: "Prevención",
  operaciones: "Operaciones",
  comite_paritario: "Comité Paritario",
};

const COLORS = {
  signed: "hsl(var(--success))",
  pending: "hsl(var(--warning))",
  areas: [
    "hsl(var(--primary))",
    "hsl(var(--info))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--accent-foreground))",
  ],
};

function useSignatureStats() {
  return useQuery({
    queryKey: ["signature-stats"],
    queryFn: async (): Promise<SignatureStats> => {
      // Fetch all signatures with employee and document data
      const { data: signatures, error } = await supabase
        .from("pending_signatures")
        .select(`
          id,
          status,
          created_at,
          signed_at,
          employee:employees(id, name, area),
          document:documents(id, title)
        `);

      if (error) throw error;

      const total = signatures?.length || 0;
      const signed = signatures?.filter((s) => s.status === "signed").length || 0;
      const pending = total - signed;

      // Group by area
      const areaMap = new Map<string, { signed: number; pending: number }>();
      signatures?.forEach((sig) => {
        const area = (sig.employee as any)?.area || "sin_area";
        const current = areaMap.get(area) || { signed: 0, pending: 0 };
        if (sig.status === "signed") {
          current.signed += 1;
        } else {
          current.pending += 1;
        }
        areaMap.set(area, current);
      });

      const byArea = Array.from(areaMap.entries()).map(([area, stats]) => ({
        area: areaLabels[area] || area,
        ...stats,
      }));

      // Group by month
      const monthMap = new Map<string, { signed: number; pending: number }>();
      signatures?.forEach((sig) => {
        const date = new Date(sig.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("es-CL", { month: "short", year: "2-digit" });
        const current = monthMap.get(monthKey) || { signed: 0, pending: 0, label: monthLabel };
        if (sig.status === "signed") {
          current.signed += 1;
        } else {
          current.pending += 1;
        }
        monthMap.set(monthKey, { ...current, label: monthLabel } as any);
      });

      const byMonth = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([, stats]) => ({
          month: (stats as any).label,
          signed: stats.signed,
          pending: stats.pending,
        }));

      // Group by document
      const docMap = new Map<string, { title: string; signed: number; pending: number }>();
      signatures?.forEach((sig) => {
        const doc = sig.document as any;
        if (!doc?.id) return;
        const current = docMap.get(doc.id) || { title: doc.title, signed: 0, pending: 0 };
        if (sig.status === "signed") {
          current.signed += 1;
        } else {
          current.pending += 1;
        }
        docMap.set(doc.id, current);
      });

      const byDocument = Array.from(docMap.values())
        .map((d) => ({ ...d, total: d.signed + d.pending }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return { total, signed, pending, byArea, byMonth, byDocument };
    },
  });
}

export function DocumentStatsDashboard() {
  const { data: stats, isLoading } = useSignatureStats();
  const [isExporting, setIsExporting] = useState(false);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Firmadas", value: stats.signed, color: COLORS.signed },
      { name: "Pendientes", value: stats.pending, color: COLORS.pending },
    ];
  }, [stats]);

  const completionRate = stats?.total ? Math.round((stats.signed / stats.total) * 100) : 0;

  const handleExportPDF = async () => {
    if (!stats) return;
    setIsExporting(true);
    try {
      await exportSignatureStatsPDF(stats);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!stats?.total) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">Sin datos de firmas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crea una campaña de firmas para ver estadísticas
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with export button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Estadísticas de Firmas</h2>
          <p className="text-sm text-muted-foreground">Vista general del estado de campañas</p>
        </div>
        <Button onClick={handleExportPDF} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Exportar PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Firmas</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Firmadas</p>
                <p className="text-3xl font-bold text-success">{stats.signed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Cumplimiento</p>
                <p className="text-3xl font-bold text-info">{completionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart - Signed vs Pending */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Firmas</CardTitle>
            <CardDescription>Distribución global de firmas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - By Area */}
        <Card>
          <CardHeader>
            <CardTitle>Firmas por Área</CardTitle>
            <CardDescription>Comparación de cumplimiento por área</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byArea} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="area" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="signed" name="Firmadas" fill={COLORS.signed} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pending" name="Pendientes" fill={COLORS.pending} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Line Chart - Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>Evolución de firmas en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.byMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="signed" name="Firmadas" stroke={COLORS.signed} strokeWidth={2} dot={{ fill: COLORS.signed, strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="pending" name="Pendientes" stroke={COLORS.pending} strokeWidth={2} dot={{ fill: COLORS.pending, strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Top Documentos</CardTitle>
            <CardDescription>Documentos con más campañas de firma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byDocument} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="signed" name="Firmadas" stackId="a" fill={COLORS.signed} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pendientes" stackId="a" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
