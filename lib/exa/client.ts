const EXA_API_URL = "https://api.exa.ai";

export class ExaClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.EXA_API_KEY || "";
  }

  async search(query: string, options?: { numResults?: number; type?: string }): Promise<ExaSearchResult[]> {
    if (!this.apiKey) return [];
    try {
      const res = await fetch(`${EXA_API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({
          query,
          numResults: options?.numResults || 10,
          type: options?.type || "auto",
          useAutoprompt: true,
          contents: { text: { maxCharacters: 2000 }, highlights: true },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch {
      return [];
    }
  }

  async findSimilar(url: string, numResults = 5): Promise<ExaSearchResult[]> {
    if (!this.apiKey) return [];
    try {
      const res = await fetch(`${EXA_API_URL}/findSimilar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({ url, numResults, contents: { text: { maxCharacters: 1000 } } }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch {
      return [];
    }
  }
}

export interface ExaSearchResult {
  title: string;
  url: string;
  text?: string;
  highlights?: string[];
  score?: number;
  publishedDate?: string;
  author?: string;
}

export const exaClient = new ExaClient();
