export type AuditJobInput = {
  url: string;
  businessType: string;
  city: string;
  state: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseAuditJobInput(body: unknown): AuditJobInput | string {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
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
  if (parsedUrl.toString().length > 2048) {
    return "url must be no longer than 2,048 characters.";
  }
  if (parsedUrl.username || parsedUrl.password) {
    return "url must not contain embedded credentials.";
  }

  return {
    url: parsedUrl.toString(),
    businessType: (input.businessType as string).trim().slice(0, 120),
    city: (input.city as string).trim().slice(0, 120),
    state: (input.state as string).trim().slice(0, 120),
  };
}
