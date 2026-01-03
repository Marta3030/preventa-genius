import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: "success" | "warning" | "danger" | "neutral";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = "neutral",
  className,
}: MetricCardProps) {
  const statusColors = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    neutral: "bg-primary/10 text-primary border-primary/20",
  };

  const trendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const TrendIcon = trendIcon;

  return (
    <div
      className={cn(
        "metric-card group animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "p-2.5 rounded-lg border transition-transform group-hover:scale-110",
            statusColors[status]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && TrendIcon && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground">{trend.label}</p>
        )}
      </div>
    </div>
  );
}
