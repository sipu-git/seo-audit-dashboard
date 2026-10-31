import { dataforseo, gsc, pagespeed, USE_MOCKS } from "../mocks";

export function getSeoData() {
  if (!USE_MOCKS) {
    throw new Error("Real SEO integrations are not configured yet.");
  }

  return {
    source: "mock",
    pagespeed,
    gsc,
    rankings: dataforseo,
  };
}