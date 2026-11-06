import type { AuditPreviewInput, AuditAnalysis } from "../ai/nemotron/types";

export type AuditPdfData = {
  jobId: string;
  createdAt: Date | string;
  business: AuditPreviewInput;
  analysis: AuditAnalysis;
  dataSources?: Record<string, string>;
  note?: string | null;
};
