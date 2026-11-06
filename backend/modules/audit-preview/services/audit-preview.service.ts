import { crawlPage } from "../../shared/crawler/index";
import { analyzeAuditWithNemotron } from "../../shared/ai/nemotron";
import type { AuditPreviewInput } from "../validations/audit-preview.validation";
import { getPageSpeedData } from "../repositories/pagespeed.repository";
import { getSearchConsoleData } from "../repositories/search-console.repository";
import { getKeywordRankings } from "../repositories/rankings.repository";
import { loadProvider, type ProviderResult } from "../repositories/provider-result.repository";

export type { AuditPreviewInput } from "../validations/audit-preview.validation";

export async function getAuditPreview(input: AuditPreviewInput, onProgress?: (progress: number) => Promise<void> | void) {
  await onProgress?.(20);
  const crawl = await crawlPage(input.url);
  await onProgress?.(45);

  const [pagespeedResult, searchConsoleResult, rankingsResult] = await Promise.all([
    loadProvider("PageSpeed Insights", () => getPageSpeedData(input.url)),
    loadProvider("Google Search Console", () => getSearchConsoleData(input.url)),
    loadProvider("DataForSEO", () => getKeywordRankings(input.businessType, input.city, input.state)),
  ]);
  const providerData = (result: ProviderResult) => result.status === "live"
    ? result.data
    : { status: result.status, reason: result.reason };
  const signals = {
    crawl,
    pagespeed: providerData(pagespeedResult),
    googleSearchConsole: providerData(searchConsoleResult),
    keywordRankings: providerData(rankingsResult),
  };
  await onProgress?.(55);
  const analysis = await analyzeAuditWithNemotron(input, signals);
  await onProgress?.(90);

  const dataSources = {
    crawl: "live",
    pagespeed: pagespeedResult.status,
    googleSearchConsole: searchConsoleResult.status,
    keywordRankings: rankingsResult.status,
    analysis: "nvidia-nemotron",
  };
  const unavailableSources = Object.entries(dataSources)
    .filter(([name, status]) => name !== "crawl" && name !== "analysis" && status !== "live")
    .map(([name, status]) => `${name} ${status}`);

  return {
    status: "completed",
    dataSources,
    business: input,
    signals,
    analysis,
    note: unavailableSources.length
      ? `SEO data sources not available: ${unavailableSources.join(", ")}. Configure provider credentials or retry later.`
      : "Crawl, PageSpeed, Search Console, and keyword ranking signals were loaded from live sources.",
  };
}
