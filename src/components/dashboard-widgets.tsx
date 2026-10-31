import { Badge } from "./ui/badge";
import { Icon } from "./icons";

type MetricIcon = "file" | "clock" | "check" | "chart";
type MetricTone = "lilac" | "mint" | "blue" | "peach";

export function DashboardMetricCard({
  icon,
  tone,
  label,
  value,
  unit,
  description,
}: {
  icon: MetricIcon;
  tone: MetricTone;
  label: string;
  value: string | number;
  unit?: string;
  description: string;
}) {
  return (
    <div className="metric-card">
      <span className={`metric-icon metric-icon-${tone}`}>
        <Icon name={icon} />
      </span>
      <div>
        <span className="metric-label">{label}</span>
        <strong>
          {value}
          {unit && <small className="metric-unit">{unit}</small>}
        </strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

export function auditStateLabel(state: string) {
  if (state === "COMPLETED" || state === "completed") return "Completed";
  if (state === "FAILED" || state === "failed") return "Failed";
  if (["PROCESSING", "processing", "active"].includes(state)) return "In progress";
  return "Queued";
}

export function AuditStatusBadge({
  state,
  showIndicator = false,
}: {
  state: string;
  showIndicator?: boolean;
}) {
  const normalizedState = state.toLowerCase();
  const variant =
    state === "COMPLETED" || state === "completed"
      ? "success"
      : state === "FAILED" || state === "failed"
        ? "destructive"
        : ["PROCESSING", "processing", "active"].includes(state)
          ? "secondary"
          : "warning";

  return (
    <Badge
      variant={variant}
      className={`state-badge state-${normalizedState}`}
    >
      {showIndicator && <i />}
      {auditStateLabel(state)}
    </Badge>
  );
}
