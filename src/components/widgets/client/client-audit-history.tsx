import type { LocalAudit } from "../../audit-types";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import { Button } from "../../ui/button";

export function ClientAuditHistory({
  audits,
  hydrated,
  selectedJobId,
  onSelect,
}: {
  audits: LocalAudit[];
  hydrated: boolean;
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
}) {
  return (
    <section className="history-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">WORK HISTORY</p>
          <h2>Recent audits</h2>
          <p>Follow each job from queue to finished report.</p>
        </div>
        <span className="history-count">{audits.length}</span>
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
    </section>
  );
}
