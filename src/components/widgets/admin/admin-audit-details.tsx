import type { AuditRow } from "../../audit-types";
import { AuditReport } from "../../audit-report";
import { AuditStatusBadge } from "../../dashboard-widgets";
import { Icon } from "../../icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminAuditDetails({
  audit,
  onClose,
}: {
  audit: AuditRow | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={Boolean(audit)} onOpenChange={(open) => !open && onClose()}>
      {audit && (
        <SheetContent
          side="right"
          className="audit-detail-sheet"
          aria-describedby="audit-detail-description"
        >
          <SheetHeader className="modal-heading">
            <div>
              <p className="eyebrow">JOB {audit.jobId}</p>
              <SheetTitle className="modal-title">Audit details</SheetTitle>
              <SheetDescription
                id="audit-detail-description"
                className="modal-description"
              >
                {audit.url}
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="modal-meta">
            <AuditStatusBadge state={audit.status} showIndicator />
            <span>
              {audit.city}, {audit.state}
            </span>
            <span>{dateLabel(audit.createdAt)}</span>
          </div>
          {audit.status === "FAILED" && (
            <div className="job-message job-message-error">
              <Icon name="alert" />
              <div>
                <strong>Audit failed</strong>
                <p>{audit.error || "No error detail was recorded."}</p>
              </div>
            </div>
          )}
          {audit.analysis ? (
            <AuditReport
              result={{
                analysis: audit.analysis,
                dataSources: audit.dataSources ?? undefined,
                business: {
                  url: audit.url,
                  businessType: audit.businessType,
                  city: audit.city,
                  state: audit.state,
                },
                note: "Source labels identify live crawl data and mocked provider signals.",
              }}
              compact
              reportJobId={audit.reportAvailable ? audit.jobId : undefined}
            />
          ) : (
            audit.status !== "FAILED" && (
              <div className="job-message">
                <Icon name="clock" />
                <div>
                  <strong>Report is not ready yet</strong>
                  <p>
                    Close this panel and refresh the queue after the worker
                    completes.
                  </p>
                </div>
              </div>
            )
          )}
        </SheetContent>
      )}
    </Sheet>
  );
}
