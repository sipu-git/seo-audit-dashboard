import { fetchTextResource } from "./http";

export function getSitemapLocations(robotsBody: string, origin: string): string[] {
  const locations = robotsBody
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*sitemap:\s*(\S+)/i)?.[1])
    .filter((location): location is string => Boolean(location));

  const sameOriginLocations = locations.flatMap((location) => {
    try {
      const sitemapUrl = new URL(location, origin);
      return sitemapUrl.origin === origin ? [sitemapUrl.toString()] : [];
    } catch {
      return [];
    }
  });

  return Array.from(new Set(sameOriginLocations)).slice(0, 3);
}

export async function checkRobots(origin: string) {
  const result = await fetchTextResource(new URL("/robots.txt", origin));

  return {
    url: result.url,
    available: result.available,
    status: result.status,
    error: result.error ?? null,
    disallowRules: result.body
      .split(/\r?\n/)
      .filter((line) => /^\s*disallow\s*:/i.test(line))
      .map((line) => line.trim()),
    sitemapReferences: getSitemapLocations(result.body, origin),
  };
}
