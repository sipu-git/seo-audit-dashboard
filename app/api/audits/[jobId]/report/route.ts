import { NextResponse } from "next/server";
import { AuditStatus, Prisma } from "@prisma/client";
import type { AuditAnalysis } from "@/src/components/audit-types";
import { prisma } from "@/src/lib/prisma";
import { generateAuditPdf } from "@/src/lib/reports/pdf/generate";
import {
  getS3DownloadUrl,
  isAuditReportReference,
  readLocalAuditReport,
  storeAuditReport,
} from "@/src/lib/storage/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasUsableAnalysis(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    typeof value.overall_score === "number";
}

async function rebuildReport(audit: {
  jobId: string;
  status: string;
  url: string;
  businessType: string;
  city: string;
  state: string;
  analysis: Prisma.JsonValue | null;
  dataSources: Prisma.JsonValue | null;
  note: string | null;
  createdAt: Date;
}): Promise<string | null> {
  if (audit.status !== AuditStatus.COMPLETED || !audit.analysis || !hasUsableAnalysis(audit.analysis)) {
    return null;
  }

  const pdf = await generateAuditPdf({
    jobId: audit.jobId,
    createdAt: audit.createdAt,
    business: {
      url: audit.url,
      businessType: audit.businessType,
      city: audit.city,
      state: audit.state,
    },
    analysis: audit.analysis as unknown as AuditAnalysis,
    dataSources: audit.dataSources && typeof audit.dataSources === "object" && !Array.isArray(audit.dataSources)
      ? audit.dataSources as unknown as Record<string, string>
      : undefined,
    note: audit.note,
  });

  const reportPath = await storeAuditReport(audit.jobId, pdf);
  await prisma.audit.update({
    where: { jobId: audit.jobId },
    data: { reportPath },
  });
  console.warn(`Rebuilt missing PDF report for audit ${audit.jobId}.`);
  return reportPath;
}

export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const audit = await prisma.audit.findUnique({
      where: { jobId: params.jobId },
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

    if (!audit) {
      return NextResponse.json({ error: "Audit report not found." }, { status: 404 });
    }
    let reportPath = audit.reportPath;
    if (!reportPath || !isAuditReportReference(reportPath)) {
      reportPath = await rebuildReport(audit);
    }
    if (!reportPath) {
      return NextResponse.json({ error: "The PDF report is not ready yet. Wait for the audit to complete, then try again." }, { status: 409 });
    }

    const s3Url = await getS3DownloadUrl(reportPath);
    if (s3Url) {
      return NextResponse.redirect(s3Url, {
        status: 302,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    let pdf: Buffer;
    try {
      pdf = await readLocalAuditReport(reportPath);
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
      const recoveredPath = await rebuildReport(audit);
      if (!recoveredPath) throw error;
      pdf = await readLocalAuditReport(recoveredPath);
    }
    const safeJobId = params.jobId.replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.byteLength),
        "Content-Disposition": `attachment; filename="seo-audit-${safeJobId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Unable to deliver the audit PDF report:", error);
    return NextResponse.json({ error: "Unable to download the PDF report." }, { status: 503 });
  }
}
