import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import type { AuditJobInput } from "../validations/audit-input.validation";

export function listAudits(take: number) {
  return prisma.audit.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobId: true,
      url: true,
      businessType: true,
      city: true,
      state: true,
      status: true,
      overallScore: true,
      dataSources: true,
      analysis: true,
      reportPath: true,
      error: true,
      createdAt: true,
      completedAt: true,
    },
  });
}

export function findAuditReport(jobId: string) {
  return prisma.audit.findUnique({
    where: { jobId },
    select: {
      jobId: true,
      status: true,
      url: true,
      businessType: true,
      city: true,
      state: true,
      analysis: true,
      dataSources: true,
      note: true,
      createdAt: true,
      reportPath: true,
    },
  });
}

export function updateAuditReportPath(jobId: string, reportPath: string) {
  return prisma.audit.update({ where: { jobId }, data: { reportPath } });
}

export function markAuditProcessing(jobId: string, input: AuditJobInput) {
  return prisma.audit.upsert({
    where: { jobId },
    create: { jobId, ...input, status: "PROCESSING" },
    update: {
      ...input,
      status: "PROCESSING",
      error: null,
      completedAt: null,
    },
  });
}

export function saveAuditAnalysis(
  jobId: string,
  result: {
    overallScore: number;
    dataSources: Prisma.InputJsonValue;
    signals: Prisma.InputJsonValue;
    analysis: Prisma.InputJsonValue;
    note: string;
  },
) {
  return prisma.audit.update({
    where: { jobId },
    data: {
      overallScore: result.overallScore,
      dataSources: result.dataSources,
      signals: result.signals,
      analysis: result.analysis,
      note: result.note,
      error: null,
      reportPath: null,
    },
  });
}

export function markAuditCompleted(jobId: string, reportPath: string) {
  return prisma.audit.update({
    where: { jobId },
    data: {
      status: "COMPLETED",
      reportPath,
      error: null,
      completedAt: new Date(),
    },
  });
}

export function markAuditFailed(jobId: string, error: string, retryPending: boolean) {
  return prisma.audit.update({
    where: { jobId },
    data: retryPending
      ? { status: "PROCESSING", error: null }
      : { status: "FAILED", error },
  });
}
