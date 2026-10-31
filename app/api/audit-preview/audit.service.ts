import { crawlPage } from "@/src/lib/crawler";
import { analyzeAuditWithNemotron } from "@/src/lib/ai/nemotron";
import { USE_MOCKS, dataforseo, gsc, pagespeed } from "@/src/mocks";

export type AuditPreviewInput = {
  url: string;
  businessType: string;
  city: string;
  state: string;
};

export async function getAuditPreview(input: AuditPreviewInput, onProgress?: (progress: number) => Promise<void> | void) {
  if (!USE_MOCKS) {
    throw new Error("Mock integrations are disabled. Real integrations are not configured yet.");
  }
  await onProgress?.(20);
  const crawl = await crawlPage(input.url);
  await onProgress?.(45);
  const signals = {
    crawl,
    pagespeed,
    googleSearchConsole: gsc,
    keywordRankings: dataforseo,
  };
  await onProgress?.(55);
  const analysis = await analyzeAuditWithNemotron(input, signals);
  await onProgress?.(90);

  return {
    status: "completed",
    dataSources: {
      crawl: "live",
      pagespeed: "mock",
      googleSearchConsole: "mock",
      keywordRankings: "mock",
      analysis: "nvidia-nemotron",
    },
    business: input,
    signals,
    analysis,
    note: "PageSpeed, Search Console, and keyword ranking signals are sample data. Crawl results come from the submitted website.",
  };
}
