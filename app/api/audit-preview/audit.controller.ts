import { NextResponse } from "next/server";
import { getAuditPreview } from "./audit.service";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createAuditPreview(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const fields = ["url", "businessType", "city", "state"] as const;
  const missing = fields.filter((field) => !isNonEmptyString(input[field]));

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Required fields: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL((input.url as string).trim());
  } catch {
    return NextResponse.json({ error: "url must be a valid absolute URL." }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "url must use http or https." }, { status: 400 });
  }

  try {
    const result = await getAuditPreview({
      url: parsedUrl.toString(),
      businessType: (input.businessType as string).trim(),
      city: (input.city as string).trim(),
      state: (input.state as string).trim(),
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create audit preview.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
