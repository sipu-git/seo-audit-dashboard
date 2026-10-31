export const CRAWLER_USER_AGENT = "SEO-Audit-Bot/1.0";

export type TextResourceResult = {
  url: string;
  status: number | null;
  available: boolean;
  body: string;
  error?: string;
};

export async function fetchTextResource(resourceUrl: URL): Promise<TextResourceResult> {
  try {
    const response = await fetch(resourceUrl, {
      headers: { "User-Agent": CRAWLER_USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    const body = response.ok ? await response.text() : "";

    return {
      url: response.url || resourceUrl.toString(),
      status: response.status,
      available: response.ok,
      body,
    };
  } catch (error) {
    return {
      url: resourceUrl.toString(),
      status: null,
      available: false,
      body: "",
      error: error instanceof Error ? error.message : "Request failed.",
    };
  }
}
