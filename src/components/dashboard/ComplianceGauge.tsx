import { cn } from "@/lib/utils";

interface ComplianceGaugeProps {
  label: string;
  value: number;
  maxValue?: number;
  status?: "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ComplianceGauge({
  label,
  value,
  maxValue = 100,
  status,
  size = "md",
}: ComplianceGaugeProps) {
  const percentage = (value / maxValue) * 100;
  
  // Auto-determine status if not provided
  const autoStatus = status || (percentage >= 80 ? "success" : percentage >= 60 ? "warning" : "danger");

  const statusColors = {
    success: {
      bg: "bg-success/20",
      fill: "bg-success",
      text: "text-success",
    },
    warning: {
      bg: "bg-warning/20",
      fill: "bg-warning",
      text: "text-warning",
    },
    danger: {
      bg: "bg-destructive/20",
      fill: "bg-destructive",
      text: "text-destructive",
    },
  };

  const sizeClasses = {
    sm: { container: "h-1.5", text: "text-xs", value: "text-lg" },
    md: { container: "h-2", text: "text-sm", value: "text-2xl" },
    lg: { container: "h-3", text: "text-base", value: "text-3xl" },
  };

  const colors = statusColors[autoStatus];
  const sizes = sizeClasses[size];

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className={cn("font-medium text-foreground", sizes.text)}>
          {label}
        </span>
        <span className={cn("font-bold", sizes.value, colors.text)}>
          {value}%
        </span>
      </div>
      <div className={cn("w-full rounded-full overflow-hidden", colors.bg, sizes.container)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.fill)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
