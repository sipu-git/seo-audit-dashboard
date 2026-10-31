import { NextResponse } from "next/server";
import { getAuditQueue } from "@/src/lib/audit-queue";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const job = await getAuditQueue().getJob(params.jobId);
    if (!job) {
      return NextResponse.json({ error: "Audit job not found." }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      state: await job.getState(),
      progress: job.progress,
      result: job.returnvalue ?? null,
      error: job.failedReason || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read audit status.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
