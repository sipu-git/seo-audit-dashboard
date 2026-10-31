import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { parseAuditJobInput } from "@/src/lib/audit-input";
import { getAuditQueue } from "@/src/lib/audit-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SCHEDULED_TARGETS = 30;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return false;

  const provided = Buffer.from(match[1]);
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function getWindowKey(now: Date, interval: string) {
  if (interval === "2m" || interval === "5m") {
    const bucketMs = interval === "2m" ? 2 * 60_000 : 5 * 60_000;
    return String(Math.floor(now.getTime() / bucketMs));
  }
  if (interval === "hourly") return now.toISOString().slice(0, 13);
  if (interval === "daily") return now.toISOString().slice(0, 10);
  if (interval === "monthly") return now.toISOString().slice(0, 7);
  throw new Error("CRON_AUDIT_INTERVAL must be monthly, daily, hourly, 5m, or 2m.");
}

function getScheduledTargets() {
  const raw = process.env.SCHEDULED_AUDIT_TARGETS?.trim();
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SCHEDULED_AUDIT_TARGETS must be a valid JSON array.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("SCHEDULED_AUDIT_TARGETS must be a JSON array.");
  }
  if (parsed.length > MAX_SCHEDULED_TARGETS) {
    throw new Error(`SCHEDULED_AUDIT_TARGETS can contain at most ${MAX_SCHEDULED_TARGETS} entries.`);
  }

  return parsed.map((target, index) => {
    const result = parseAuditJobInput(target);
    if (typeof result === "string") {
      throw new Error(`Scheduled audit target ${index + 1} is invalid: ${result}`);
    }
    return result;
  });
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Scheduled audit endpoint is not configured." }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let targets;
  let windowKey: string;
  try {
    targets = getScheduledTargets();
    windowKey = getWindowKey(new Date(), process.env.CRON_AUDIT_INTERVAL?.trim() || "monthly");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduled audit configuration is invalid.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (targets.length === 0) {
    return NextResponse.json({ error: "No scheduled audit targets are configured." }, { status: 409 });
  }

  try {
    const queue = getAuditQueue();
    const jobs = await Promise.all(targets.map((target) => {
      const digest = createHash("sha256").update(JSON.stringify(target)).digest("hex").slice(0, 16);
      return queue.add("site-audit", target, {
        jobId: `cron-${windowKey.replace(/[^a-zA-Z0-9_-]/g, "-")}-${digest}`,
        removeOnComplete: 100,
        removeOnFail: 500,
      });
    }));

    return NextResponse.json({
      status: "queued",
      interval: process.env.CRON_AUDIT_INTERVAL?.trim() || "monthly",
      queuedCount: jobs.length,
      jobs: jobs.map((job) => ({ jobId: job.id, statusUrl: `/api/audits/${job.id}` })),
    }, { status: 202 });
  } catch (error) {
    console.error("Unable to enqueue scheduled audits:", error);
    return NextResponse.json({ error: "Unable to queue scheduled audits." }, { status: 503 });
  }
}
