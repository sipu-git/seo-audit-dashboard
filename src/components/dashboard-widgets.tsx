import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
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
    <Card className="metric-card flex min-h-[94px] items-center gap-[14px] rounded-[14px] border-[#e8eeea] bg-white p-[18px_20px] shadow-[0_4px_14px_#293e3210]">
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
    </Card>
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
      className={`rounded-full px-2 py-1 text-[9px] ${normalizedState}`}
    >
      {showIndicator && (
        <i
          aria-hidden="true"
          className="mr-1 inline-block size-[5px] shrink-0 rounded-full bg-current align-middle"
        />
      )}
      {auditStateLabel(state)}
    </Badge>
  );
}
