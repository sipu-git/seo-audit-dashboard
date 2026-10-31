import { NextResponse } from "next/server";
import { getAuditQueue, type AuditJobInput } from "@/src/lib/audit-queue";
import { prisma } from "@/src/lib/prisma";

export async function listAudits(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") ?? 50);
  const take = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.floor(requestedLimit))) : 50;

  try {
    const rows = await prisma.audit.findMany({
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
    const audits = await Promise.all(rows.map(async (audit) => {
      const { reportPath, ...publicAudit } = audit;
      const reportAvailable = Boolean(reportPath);
      if (audit.status === "COMPLETED") return { ...publicAudit, reportAvailable, progress: 100 };
      if (audit.status === "FAILED") return { ...publicAudit, reportAvailable, progress: 0 };
      try {
        const job = await getAuditQueue().getJob(audit.jobId);
        const value = job?.progress;
        return { ...publicAudit, reportAvailable, progress: typeof value === "number" ? value : 0 };
      } catch {
        return { ...publicAudit, reportAvailable, progress: 0 };
      }
    }));
    return NextResponse.json({ audits });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load audit records.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseAuditInput(body: unknown): AuditJobInput | string {
  if (typeof body !== "object" || body === null) {
    return "Request body must be a JSON object.";
  }

  const input = body as Record<string, unknown>;
  const fields = ["url", "businessType", "city", "state"] as const;
  const missing = fields.filter((field) => !isNonEmptyString(input[field]));
  if (missing.length > 0) {
    return `Required fields: ${missing.join(", ")}.`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL((input.url as string).trim());
  } catch {
    return "url must be a valid absolute URL.";
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return "url must use http or https.";
  }

  return {
    url: parsedUrl.toString(),
    businessType: (input.businessType as string).trim(),
    city: (input.city as string).trim(),
    state: (input.state as string).trim(),
  };
}

export async function enqueueAudit(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = parseAuditInput(body);
  if (typeof input === "string") {
    return NextResponse.json({ error: input }, { status: 400 });
  }

  try {
    const job = await getAuditQueue().add("site-audit", input, {
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    return NextResponse.json(
      { jobId: job.id, status: "queued", statusUrl: `/api/audits/${job.id}` },
      { status: 202 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to queue the audit.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
