import type { Request, Response } from "express";
import { getAuditPreview } from "../services/audit-preview.service";
import { parseAuditPreviewInput } from "../validations/audit-preview.validation";

export async function createAuditPreviewController(request: Request, response: Response) {
  const input = parseAuditPreviewInput(request.body);
  if (typeof input === "string") {
    response.status(400).json({ error: input });
    return;
  }

  try {
    response.json(await getAuditPreview(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create audit preview.";
    response.status(503).json({ error: message });
  }
}
