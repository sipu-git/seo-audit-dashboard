import { enqueueAudit, listAudits } from "./controller";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return listAudits(request);
}

export async function POST(request: Request) {
  return enqueueAudit(request);
}
