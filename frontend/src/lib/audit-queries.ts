import type { AuditJobStatus, AuditRow } from "@/src/components/audit-types";

export const auditListQueryKey = ["audits"] as const;

export const auditJobQueryKey = (jobId: string) =>
  ["audit-job", jobId] as const;

async function responseError(response: Response, fallback: string) {
  const payload = (await response.json()) as { error?: string };
  return new Error(payload.error || fallback);
}

export async function fetchAudits(signal?: AbortSignal): Promise<AuditRow[]> {
  const response = await fetch("/api/audits?limit=100", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw await responseError(response, "Could not load audit records.");
  }

  const payload = (await response.json()) as { audits: AuditRow[] };
  return payload.audits;
}

export async function fetchAuditJob(
  jobId: string,
  signal?: AbortSignal,
): Promise<AuditJobStatus> {
  const response = await fetch(`/api/audits/${encodeURIComponent(jobId)}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw await responseError(response, "Could not load audit status.");
  }

  return (await response.json()) as AuditJobStatus;
}
