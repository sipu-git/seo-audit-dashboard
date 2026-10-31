import { fetchAndParsePage } from "./page";
import { checkRobots } from "./robots";
import { checkSitemaps } from "./sitemap";

export async function crawlPage(inputUrl: string) {
  const page = await fetchAndParsePage(inputUrl);
  const finalOrigin = new URL(page.finalUrl).origin;
  const robots = await checkRobots(finalOrigin);
  const sitemaps = await checkSitemaps(robots.sitemapReferences, finalOrigin);

  return { ...page, robots, sitemaps };
}
