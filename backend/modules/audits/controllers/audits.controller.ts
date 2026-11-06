import type { Request, Response } from "express";
import { createAudit, getAuditJobStatus, getAudits } from "../services/audits.service";
import { parseAuditJobInput } from "../validations/audit-input.validation";

export async function listAuditsController(request: Request, response: Response) {
  const requestedLimit = Number(request.query.limit ?? 50);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
    : 50;

  try {
    response.json({ audits: await getAudits(limit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load audit records.";
    response.status(503).json({ error: message });
  }
}

export async function createAuditController(request: Request, response: Response) {
  const input = parseAuditJobInput(request.body);
  if (typeof input === "string") {
    response.status(400).json({ error: input });
    return;
  }

  try {
    const job = await createAudit(input);
    response.status(202).json({
      jobId: job.id,
      status: "queued",
      statusUrl: `/api/audits/${job.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to queue the audit.";
    response.status(503).json({ error: message });
  }
}

export async function getAuditStatusController(request: Request, response: Response) {
  try {
    const status = await getAuditJobStatus(request.params.jobId);
    if (!status) {
      response.status(404).json({ error: "Audit job not found." });
      return;
    }
    response.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read audit status.";
    response.status(503).json({ error: message });
  }
}
