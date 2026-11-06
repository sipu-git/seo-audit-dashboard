import type { LocalAudit } from "../../audit-types";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";

export function ClientAuditHistory({
  audits,
  hydrated,
  selectedJobId,
  onSelect,
  onClear,
}: {
  audits: LocalAudit[];
  hydrated: boolean;
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
  onClear: () => void;
}) {
  return (
    <Card className="history-card flex h-full min-w-0 flex-col p-6 max-[560px]:p-4">
      <div className="card-heading">
        <div>
          <p className="eyebrow">WORK HISTORY</p>
          <h2>Recent audits</h2>
          <p>Follow each job from queue to finished report.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="history-count">{audits.length}</span>
          {hydrated && audits.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-700"
              title="Remove this history from this browser only. Stored reports and running audits are not deleted."
              onClick={onClear}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      {!hydrated ? (
        <div className="history-empty">
          <span className="spinner spinner-dark" />
          Loading your audits…
        </div>
      ) : audits.length === 0 ? (
        <div className="history-empty">
          <span className="empty-icon">
            <Icon name="file" />
          </span>
          <strong>Your audit history starts here</strong>
          <p>Submit a website to see job progress and reports in this list.</p>
        </div>
      ) : (
        <div className="history-list">
          {audits.map((audit) => (
            <Button
              key={audit.jobId}
              type="button"
              variant="ghost"
              className={`history-item ${
                selectedJobId === audit.jobId ? "history-item-selected" : ""
              }`}
              aria-pressed={selectedJobId === audit.jobId}
              onClick={() => onSelect(audit.jobId)}
            >
              <span className={`history-status-icon status-${audit.state}`}>
                <Icon
                  name={
                    audit.state === "completed"
                      ? "check"
                      : audit.state === "failed"
                        ? "alert"
                        : "clock"
                  }
                />
              </span>
              <span className="history-info">
                <strong>
                  {audit.input.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </strong>
                <small>
                  {audit.input.businessType} · {audit.input.city}
                </small>
              </span>
              <AuditStatusBadge state={audit.state} />
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
