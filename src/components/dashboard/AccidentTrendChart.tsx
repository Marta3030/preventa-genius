import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Ene", tf: 2.1, tgr: 45, nearMiss: 8 },
  { month: "Feb", tf: 1.8, tgr: 38, nearMiss: 12 },
  { month: "Mar", tf: 2.5, tgr: 52, nearMiss: 15 },
  { month: "Abr", tf: 1.5, tgr: 28, nearMiss: 18 },
  { month: "May", tf: 1.2, tgr: 22, nearMiss: 22 },
  { month: "Jun", tf: 1.8, tgr: 35, nearMiss: 20 },
  { month: "Jul", tf: 2.0, tgr: 42, nearMiss: 16 },
  { month: "Ago", tf: 1.4, tgr: 25, nearMiss: 24 },
  { month: "Sep", tf: 1.1, tgr: 18, nearMiss: 28 },
  { month: "Oct", tf: 0.9, tgr: 15, nearMiss: 32 },
  { month: "Nov", tf: 1.2, tgr: 20, nearMiss: 30 },
  { month: "Dic", tf: 0.8, tgr: 12, nearMiss: 35 },
];

export function AccidentTrendChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">
          Tendencia de Accidentabilidad
        </h3>
        <p className="text-sm text-muted-foreground">
          Últimos 12 meses • TF, TGR y Near Miss
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "12px" }}
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                  {value === "tf"
                    ? "Tasa Frecuencia"
                    : value === "tgr"
                    ? "Tasa Gravedad"
                    : "Near Miss"}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="tf"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="tgr"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--warning))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="nearMiss"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--success))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">0.8</p>
            <p className="text-xs text-muted-foreground">TF Actual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">12</p>
            <p className="text-xs text-muted-foreground">TGR Actual</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">35</p>
            <p className="text-xs text-muted-foreground">Near Miss</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-success">↓ 62% TF vs Año Anterior</p>
          <p className="text-xs text-muted-foreground">Meta anual: &lt; 1.0</p>
        </div>
      </div>
    </div>
  );
}
