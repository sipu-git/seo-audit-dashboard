import { getAuditQueue } from "../../shared/queue/audit-queue";
import type { AuditJobInput } from "../validations/audit-input.validation";

export function enqueueAudit(input: AuditJobInput, jobId?: string) {
  return getAuditQueue().add("site-audit", input, {
    ...(jobId ? { jobId } : {}),
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export function findAuditJob(jobId: string) {
  return getAuditQueue().getJob(jobId);
}
