import type { AuditAnalysis } from "./types";

const issueFields = [
  "issue",
  "finding",
  "priority",
  "category",
  "fix",
  "estimated_impact",
  "effort",
  "falsifiability_check",
] as const;

function parseIssueList(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new Error(`Nemotron response has an invalid ${field} array.`);
  }

  return value.map((item, index) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`Nemotron response has an invalid item in ${field} at index ${index}.`);
    }

    const issue = item as Record<string, unknown>;
    if (issueFields.some((key) => key in issue && typeof issue[key] !== "string")) {
      throw new Error(`Nemotron response has a non-string issue field in ${field} at index ${index}.`);
    }

    return issue;
  });
}

export function parseAuditResponse(content: string): AuditAnalysis {
  const jsonText = content.match(/\{[\s\S]*\}/)?.[0] ?? content;
  let value: unknown;

  try {
    value = JSON.parse(jsonText);
  } catch {
    throw new Error("Nemotron did not return valid JSON for the audit.");
  }

  if (typeof value !== "object" || value === null) {
    throw new Error("Nemotron returned JSON that is not an object.");
  }

  const result = value as Record<string, unknown>;
  const breakdown = result.score_breakdown as Record<string, unknown> | undefined;
  const requiredScores = ["technical", "on_page", "content", "core_web_vitals", "schema"];
  const requiredArrays = ["critical_issues", "important_issues", "quick_wins", "recommendations"];
  const parsedIssueLists = Object.fromEntries(
    requiredArrays.map((key) => [key, parseIssueList(result[key], key)]),
  );

  if (!Number.isInteger(result.overall_score) || (result.overall_score as number) < 0 || (result.overall_score as number) > 100) {
    throw new Error("Nemotron response has an invalid overall_score.");
  }
  if (!breakdown || requiredScores.some((key) => !Number.isInteger(breakdown[key]) || (breakdown[key] as number) < 0 || (breakdown[key] as number) > 100)) {
    throw new Error("Nemotron response is missing valid score_breakdown fields.");
  }
  if (typeof result.executive_summary !== "string") {
    throw new Error("Nemotron response is missing executive_summary.");
  }

  return { ...result, ...parsedIssueLists } as unknown as AuditAnalysis;
}
