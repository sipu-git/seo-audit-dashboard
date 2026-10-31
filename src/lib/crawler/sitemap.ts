import { fetchTextResource } from "./http";

export async function checkSitemaps(sitemapReferences: string[], origin: string) {
  const sitemapUrls = sitemapReferences.length > 0
    ? sitemapReferences
    : [new URL("/sitemap.xml", origin).toString()];

  const results = await Promise.all(
    sitemapUrls.map((sitemapUrl) => fetchTextResource(new URL(sitemapUrl))),
  );

  return results.map((result) => ({
    url: result.url,
    available: result.available,
    status: result.status,
    error: result.error ?? null,
    urlCount: (result.body.match(/<loc(?:\s[^>]*)?>[\s\S]*?<\/loc>/gi) ?? []).length,
  }));
}
