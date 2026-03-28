const APIFY_API_URL = "https://api.apify.com/v2";

export class ApifyClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.APIFY_API_TOKEN || "";
  }

  async runActor(actorId: string, input: Record<string, unknown>): Promise<string | null> {
    if (!this.token) return null;
    try {
      const res = await fetch(`${APIFY_API_URL}/acts/${actorId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}` },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.id || null;
    } catch {
      return null;
    }
  }

  async getDataset(datasetId: string): Promise<unknown[]> {
    if (!this.token) return [];
    try {
      const res = await fetch(`${APIFY_API_URL}/datasets/${datasetId}/items?token=${this.token}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async getRunStatus(runId: string): Promise<string> {
    if (!this.token) return "UNKNOWN";
    try {
      const res = await fetch(`${APIFY_API_URL}/actor-runs/${runId}?token=${this.token}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return "UNKNOWN";
      const data = await res.json();
      return data?.data?.status || "UNKNOWN";
    } catch {
      return "UNKNOWN";
    }
  }
}

export const apifyClient = new ApifyClient();
