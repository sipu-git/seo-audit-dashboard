import type { CSSProperties } from "react";
import type { LocalAudit } from "../../audit-types";
import { AuditReport } from "../../audit-report";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";

export function ClientSelectedAudit({ audit }: { audit: LocalAudit }) {
  const isComplete = audit.state === "completed";
  const isFailed = audit.state === "failed";
  const progress = Math.max(8, audit.progress);

  return (
    <section className="selected-audit-area">
      <div className="card-heading selected-heading">
        <div>
          <p className="eyebrow">AUDIT {audit.jobId}</p>
          <h2>
            {isComplete
              ? "Your report is ready"
              : isFailed
                ? "This audit needs attention"
                : "Your audit is underway"}
          </h2>
          <p>{audit.input.url}</p>
        </div>
        <AuditStatusBadge state={audit.state} />
      </div>
      {isComplete && audit.result ? (
        <AuditReport result={audit.result} reportJobId={audit.jobId} />
      ) : isFailed ? (
        <div className="job-message job-message-error">
          <Icon name="alert" />
          <div>
            <strong>We couldn’t finish this audit.</strong>
            <p>
              {audit.error ||
                "Check that the website is reachable, then try again."}
            </p>
          </div>
        </div>
      ) : (
        <div className="progress-card">
          <div className="progress-visual">
            <div
              className="progress-ring"
              style={
                { "--progress": `${progress * 3.6}deg` } as CSSProperties
              }
            >
              <span>{progress}%</span>
            </div>
            <div>
              <strong>
                {audit.state === "active" || audit.state === "processing"
                  ? "Analyzing your website"
                  : "Waiting for an available worker"}
              </strong>
              <p>
                We’ll update this view automatically as the audit moves through
                the pipeline.
              </p>
            </div>
          </div>
          <div className="progress-steps">
            <span className="step-done">
              <i>
                <Icon name="check" />
              </i>
              Queued
            </span>
            <span className={audit.progress >= 20 ? "step-active" : ""}>
              <i>2</i>Website crawl
            </span>
            <span className={audit.progress >= 55 ? "step-active" : ""}>
              <i>3</i>SEO analysis
            </span>
            <span className={isComplete ? "step-done" : ""}>
              <i>4</i>Report ready
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
