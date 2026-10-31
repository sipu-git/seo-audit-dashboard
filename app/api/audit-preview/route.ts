import { createAuditPreview } from "./audit.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createAuditPreview(request);
}
