import type { AuditInput, AuditAnalysis } from "@/src/components/audit-types";

export type AuditPdfData = {
  jobId: string;
  createdAt: Date | string;
  business: AuditInput;
  analysis: AuditAnalysis;
  dataSources?: Record<string, string>;
  note?: string | null;
};
