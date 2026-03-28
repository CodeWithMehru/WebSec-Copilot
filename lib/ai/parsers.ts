import type { AIExplanation } from "@/types/finding";

export function parseAIExplanation(raw: string): AIExplanation {
  const sections: Record<string, string> = {};
  const lines = raw.split("\n");
  let currentKey = "";

  for (const line of lines) {
    const headerMatch = line.match(/^##?\s*(.+)/);
    if (headerMatch) {
      currentKey = headerMatch[1].toLowerCase().replace(/[^a-z]/g, "");
      sections[currentKey] = "";
    } else if (currentKey) {
      sections[currentKey] += line + "\n";
    }
  }

  return {
    whatHappened: sections["whathappened"]?.trim() || extractSection(raw, "What Happened"),
    whyItHappened: sections["whyithappened"]?.trim() || extractSection(raw, "Why"),
    exploitability: sections["exploitability"]?.trim() || extractSection(raw, "Exploitability"),
    attackerPerspective: sections["attackerperspective"]?.trim() || extractSection(raw, "Attacker"),
    impact: sections["impact"]?.trim() || extractSection(raw, "Impact"),
    fixRecommendation: sections["fixrecommendation"]?.trim() || extractSection(raw, "Fix"),
    saferExample: sections["saferexample"]?.trim() || extractSection(raw, "Safer"),
    stackGuidance: sections["stackguidance"]?.trim() || extractSection(raw, "Stack"),
  };
}

function extractSection(text: string, keyword: string): string {
  const regex = new RegExp(`(?:${keyword})[:\\s]*([\\s\\S]*?)(?=\\n##|$)`, "i");
  const match = text.match(regex);
  return match?.[1]?.trim() || "";
}

export function parseJsonResponse<T>(raw: string): T | null {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
    const toParse = jsonMatch ? jsonMatch[1] : raw;
    return JSON.parse(toParse);
  } catch {
    return null;
  }
}
