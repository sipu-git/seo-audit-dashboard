import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { parseAuditResponse } from "./response";
import type { AuditAnalysis, AuditPreviewInput, AuditSignals } from "./types";

export async function analyzeAuditWithNemotron(
  business: AuditPreviewInput,
  signals: AuditSignals,
): Promise<AuditAnalysis> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is missing from the server environment.");
  }

  const model = process.env.NVIDIA_MODEL_ID || "nvidia/nemotron-3-super-120b-a12b";
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(business, signals) },
      ],
      temperature: 0.2,
      max_tokens: 2500,
      stream: false,
    }),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`Nemotron API returned HTTP ${response.status}: ${details}`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Nemotron returned an empty response.");
  }

  return parseAuditResponse(content);
}
