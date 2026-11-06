export type AuditPreviewInput = {
  url: string;
  businessType: string;
  city: string;
  state: string;
};

export function parseAuditPreviewInput(body: unknown): AuditPreviewInput | string {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const input = body as Record<string, unknown>;
  const fields = ["url", "businessType", "city", "state"] as const;
  const missing = fields.filter((field) => typeof input[field] !== "string" || !input[field].trim());
  if (missing.length) return `Required fields: ${missing.join(", ")}.`;

  let url: URL;
  try {
    url = new URL((input.url as string).trim());
  } catch {
    return "url must be a valid absolute URL.";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "url must use http or https.";
  }
  if (url.username || url.password) return "url must not contain embedded credentials.";

  return {
    url: url.toString(),
    businessType: (input.businessType as string).trim().slice(0, 120),
    city: (input.city as string).trim().slice(0, 120),
    state: (input.state as string).trim().slice(0, 120),
  };
}
