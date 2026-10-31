import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { DashboardMetricCard } from "../../dashboard-widgets";
import { Button } from "../../ui/button";

export function AdminQueueStatus({
  error,
  refreshing,
  lastUpdated,
  onRefresh,
}: {
  error: string;
  refreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const checkedAt = lastUpdated?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="admin-status-line" role="status" aria-live="polite">
      <div className="monitor-status-copy">
        <span
          className={`monitor-status-icon ${error ? "monitor-status-error" : lastUpdated ? "monitor-status-live" : ""
            }`}
        >
          {error ? (
            <AlertCircle aria-hidden="true" />
          ) : refreshing ? (
            <RefreshCw className="monitor-spinning" aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
        </span>
        <div>
          <strong>
            {error
              ? "Live updates paused"
              : refreshing
                ? "Checking for updates…"
                : "Audit queue is up to date"}
          </strong>
          <span>
            {error
              ? "We couldn’t refresh the job list. Your current results are still shown."
              : checkedAt ? `Last Updated ${checkedAt}` : "Connecting to the audit queue…"}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="monitor-refresh-button"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw
          className={refreshing ? "monitor-spinning" : ""}
          aria-hidden="true"
        />
        {refreshing ? "Refreshing…" : "Refresh"}
      </Button>
    </div>
  );
}

export function AdminMetrics({
  total,
  active,
  completed,
  average,
}: {
  total: number;
  active: number;
  completed: number;
  average: number | null;
}) {
  return (
    <div className="metric-grid admin-metrics">
      <DashboardMetricCard
        icon="file"
        tone="lilac"
        label="AUDITS TOTAL"
        value={total}
        description="Stored in Supabase"
      />
      <DashboardMetricCard
        icon="clock"
        tone="mint"
        label="IN THE QUEUE"
        value={active}
        description="Queued or processing"
      />
      <DashboardMetricCard
        icon="check"
        tone="blue"
        label="COMPLETED"
        value={completed}
        description="Reports saved"
      />
      <DashboardMetricCard
        icon="chart"
        tone="peach"
        label="AVG. SEO SCORE"
        value={average ?? "—"}
        unit={average !== null ? "/100" : undefined}
        description="Across completed audits"
      />
    </div>
  );
}
