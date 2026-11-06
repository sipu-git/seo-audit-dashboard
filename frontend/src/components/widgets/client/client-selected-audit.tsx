import type { CSSProperties } from "react";
import type { LocalAudit } from "../../audit-types";
import { AuditReport } from "../../audit-report";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import { Card } from "../../ui/card";

export function ClientSelectedAudit({ audit }: { audit: LocalAudit }) {
  const isComplete = audit.state === "completed";
  const isFailed = audit.state === "failed";
  const progress = Math.min(100, Math.max(0, audit.progress));

  return (
    <Card className="selected-audit-area m-0 p-6 max-[560px]:p-4">
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
        <Card className="job-message job-message-error rounded-[10px] border-[#f0d4d1] bg-[#fff8f7] p-[15px] shadow-none">
          <Icon name="alert" />
          <div>
            <strong>We couldn’t finish this audit.</strong>
            <p>
              {audit.error ||
                "Check that the website is reachable, then try again."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="progress-card rounded-xl border-[#e8efea] bg-gradient-to-br from-[#f8fcf9] to-[#f7faff] p-5 shadow-none">
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
        </Card>
      )}
    </Card>
  );
}
