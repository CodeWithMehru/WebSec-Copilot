export class AIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      this.apiKey = groqKey;
      this.baseUrl = "https://api.groq.com/openai/v1";
      this.model = "llama-3.1-70b-versatile";
    } else {
      this.apiKey = openaiKey || "";
      this.baseUrl = "https://api.openai.com/v1";
      this.model = "gpt-4o-mini";
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    if (!this.apiKey) return "[AI unavailable — no API key configured]";
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 2000,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) return "[AI request failed]";
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "[Empty response]";
    } catch {
      return "[AI request timed out]";
    }
  }
}

export const aiClient = new AIClient();
