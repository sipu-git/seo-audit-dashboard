import { enqueueAudit, findAuditJob } from "../repositories/audit-queue.repository";
import { listAudits } from "../repositories/audits.repository";
import type { AuditJobInput } from "../validations/audit-input.validation";

export async function getAudits(limit: number) {
  const rows = await listAudits(limit);
  return Promise.all(rows.map(async (audit) => {
    const { reportPath, ...publicAudit } = audit;
    const reportAvailable = Boolean(reportPath);
    if (audit.status === "COMPLETED") return { ...publicAudit, reportAvailable, progress: 100 };
    if (audit.status === "FAILED") return { ...publicAudit, reportAvailable, progress: 0 };
    try {
      const job = await findAuditJob(audit.jobId);
      return {
        ...publicAudit,
        reportAvailable,
        progress: typeof job?.progress === "number" ? job.progress : 0,
      };
    } catch {
      return { ...publicAudit, reportAvailable, progress: 0 };
    }
  }));
}

export function createAudit(input: AuditJobInput) {
  return enqueueAudit(input);
}

export async function getAuditJobStatus(jobId: string) {
  const job = await findAuditJob(jobId);
  if (!job) return null;
  return {
    jobId: job.id,
    state: await job.getState(),
    progress: job.progress,
    result: job.returnvalue ?? null,
    error: job.failedReason || null,
  };
}
