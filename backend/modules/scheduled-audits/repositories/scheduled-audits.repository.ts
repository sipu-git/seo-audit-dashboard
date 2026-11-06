import { getAuditQueue } from "../../shared/queue/audit-queue";
import type { AuditJobInput } from "../../audits/validations/audit-input.validation";

export function enqueueScheduledAudit(jobId: string, input: AuditJobInput) {
  return getAuditQueue().add("site-audit", input, {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
