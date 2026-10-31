import { load } from "cheerio";
import { CRAWLER_USER_AGENT } from "./http";

export async function fetchAndParsePage(inputUrl: string) {
  const url = new URL(inputUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be crawled.");
  }

  const response = await fetch(url, {
    headers: { "User-Agent": CRAWLER_USER_AGENT },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Website returned an HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("The URL did not return an HTML page.");
  }

  const html = await response.text();
  const $ = load(html);
  const schema = $('script[type="application/ld+json"]')
    .map((_, element) => {
      const raw = $(element).text();
      try {
        return JSON.parse(raw);
      } catch {
        return { invalidJsonLd: true, raw };
      }
    })
    .get();

  return {
    requestedUrl: inputUrl,
    finalUrl: response.url || url.toString(),
    status: response.status,
    title: $("title").first().text().trim(),
    metaDescription: $('meta[name="description"]').attr("content")?.trim() ?? "",
    headings: {
      h1: $("h1").map((_, element) => $(element).text().trim()).get(),
      h2: $("h2").map((_, element) => $(element).text().trim()).get(),
    },
    links: $("a[href]")
      .map((_, element) => $(element).attr("href"))
      .get()
      .filter((href): href is string => Boolean(href)),
    imagesMissingAlt: $("img").filter((_, element) => !$(element).attr("alt")).length,
    canonical: $('link[rel="canonical"]').attr("href") ?? null,
    schema,
  };
}
