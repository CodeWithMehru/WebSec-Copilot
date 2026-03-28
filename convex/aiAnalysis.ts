// convex/aiAnalysis.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

type Explanation = {
  whatHappened: string;
  whyItHappened: string;
  exploitability: string;
  attackerPerspective: string;
  impact: string;
  fixRecommendation: string;
  saferExample: string;
  stackGuidance: string;
  sources?: string[];
};

type AIArgs = {
  title: string;
  description: string;
  severity: string;
  category: string;
  remediation?: string;
  affectedComponent?: string;
  targetType?: string;
  targetUrl?: string;
  stackHint?: string;
  evidence?: string;
  findingSource?: string;
};

const INFRA_KEYWORDS = [
  "Cloudflare", "Nginx", "Apache", "Express", "Next.js", "Vercel", "Netlify", 
  "Render", "Fastly", "HAProxy", "Caddy", "Django", "Flask", "Spring", "ASP.NET",
  "middleware", "reverse proxy", "CDN", "load balancer", "WAF", "Origin", "Edge"
];

function fallbackExplanation(args: AIArgs): Explanation {
  return {
    whatHappened: "Technical vulnerability detected during scan.",
    whyItHappened: "",
    exploitability: "",
    attackerPerspective: "",
    impact: `[ATTACKER PERSPECTIVE & IMPACT]
The vulnerability identified as "${args.title}" exposes the system to potential exploitation. 
An attacker could leverage this finding to gain unauthorized insight or execute malicious actions against the target application.
The exact real-world impact depends on the specific context of the weak configuration, but standard severity implications apply.
If this is a data exposure issue, it may lead to data breaches; if it's an injection issue, it could lead to account takeover or RCE.`,
    fixRecommendation: `[STEP-BY-STEP REMEDIATION]
1. Review the scanner evidence provided for "${args.title}".
2. Implement standard security best practices for the affected component.
3. If this is a missing HTTP header, configure your web server (e.g., Nginx, Apache) or application framework to append the standard secure value.
4. If this is a code-level vulnerability, sanitize all inputs, bind parameters, or update the affected library to a secure version.
5. Deploy the changes to a staging environment and verify that the vulnerability is resolved before pushing to production.`,
    saferExample: "",
    stackGuidance: "",
  };
}

function clean(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasExplicitEvidence(term: string, args: AIArgs): boolean {
  const searchSpace = [
    args.stackHint,
    args.evidence,
    args.description,
    args.remediation,
    args.affectedComponent
  ].filter(Boolean).join(" ").toLowerCase();
  
  return searchSpace.includes(term.toLowerCase());
}

function sanitizeInfraClaims(text: string, args: AIArgs): string {
  let sanitized = text;
  for (const keyword of INFRA_KEYWORDS) {
    if (!hasExplicitEvidence(keyword, args)) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (["Cloudflare", "Fastly", "CDN", "Edge", "WAF"].includes(keyword)) {
        sanitized = sanitized.replace(regex, "network layer");
      } else if (["Nginx", "Apache", "HAProxy", "Caddy", "reverse proxy", "load balancer", "Origin"].includes(keyword)) {
        sanitized = sanitized.replace(regex, "web server");
      } else if (["Express", "Next.js", "Vercel", "Netlify", "Render", "Django", "Flask", "Spring", "ASP.NET", "middleware"].includes(keyword)) {
        sanitized = sanitized.replace(regex, "application layer");
      } else {
        sanitized = sanitized.replace(regex, "infrastructure");
      }
    }
  }
  return sanitized.trim();
}

function limitSentences(text: string, max: number): string {
  if (!text || text.length < 5) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= max) return text;
  return sentences.slice(0, max).join(" ").trim();
}

function normalizeExplanation(
  parsed: Partial<Explanation> | null | undefined,
  fallback: Explanation,
  args: AIArgs
): Explanation {
  const isRuntime = args.findingSource === "runtime";
  
  const whatHappened = limitSentences(sanitizeInfraClaims(clean(parsed?.whatHappened, args.description || fallback.whatHappened), args), 2);
  
  let mergedImpact = "";
  if (isRuntime) {
    const pieces = [
      parsed?.whyItHappened,
      parsed?.exploitability,
      parsed?.attackerPerspective,
      parsed?.impact
    ].filter(p => typeof p === "string" && p.trim()).map(p => p!.trim());
    
    mergedImpact = pieces.join(" ");
    if (!mergedImpact) mergedImpact = fallback.impact;
  } else {
    mergedImpact = clean(parsed?.impact, fallback.impact);
  }
  
  // ZERO TRUNCATION for runtime: no sentence limiting on fixRecommendation or impact
  const impact = isRuntime
    ? sanitizeInfraClaims(mergedImpact, args)
    : limitSentences(sanitizeInfraClaims(mergedImpact, args), 12);
  
  let fixRec = sanitizeInfraClaims(clean(parsed?.fixRecommendation, fallback.fixRecommendation), args);
  if (!isRuntime) fixRec = limitSentences(fixRec, 20);

  const saferEx = clean(parsed?.saferExample, fallback.saferExample).replace(/```[\s\S]*?\n|```/g, "").trim();
  
  return {
    whatHappened,
    whyItHappened: isRuntime ? "" : sanitizeInfraClaims(clean(parsed?.whyItHappened, ""), args),
    exploitability: isRuntime ? "" : sanitizeInfraClaims(clean(parsed?.exploitability, ""), args),
    attackerPerspective: isRuntime ? "" : sanitizeInfraClaims(clean(parsed?.attackerPerspective, ""), args),
    impact,
    fixRecommendation: fixRec,
    saferExample: saferEx,
    // runtime mode now uses stackGuidance from AI (anti-hallucination enforced via prompt)
    stackGuidance: sanitizeInfraClaims(clean(parsed?.stackGuidance, ""), args),
    sources: Array.isArray(parsed?.sources) 
      ? parsed.sources.map(s => String(s).trim()).filter(s => s.startsWith("http")).slice(0, 3) 
      : [],
  };
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return null;
}

export const explainFinding = action({
  args: {
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    category: v.string(),
    remediation: v.optional(v.string()),
    affectedComponent: v.optional(v.string()),
    targetType: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    stackHint: v.optional(v.string()),
    evidence: v.optional(v.string()),
    findingSource: v.optional(v.string()),
  },
  handler: async (_, args): Promise<Explanation> => {
    const groqKey = process.env.GROQ_API_KEY;
    const fallback = fallbackExplanation(args);

    if (!groqKey) {
      console.error("Missing GROQ_API_KEY");
      return fallback;
    }

    const isRuntime = args.findingSource === "runtime";
    console.log(`[AI Analysis] Mode: ${isRuntime ? "RUNTIME" : "REPO"}`);

    const systemPromptRuntime = `
You are a senior security expert.

Return ONLY JSON:

{
  "fixRecommendation": "Explain clearly how to fix this issue in a long human paragraph. No code.",
  "impact": "Explain how an attacker would exploit this and what damage it causes. No code.",
  "saferExample": "Very short example (1-2 lines only)"
}

Rules:
- No code inside fixRecommendation
- No code inside impact
- Write like a human, not a template
- Keep explanations detailed but natural
- Do NOT assume stack
`.trim();

    const systemPromptRepo = `
You are a senior code security architect. Analyze this REPOSITORY finding.
- Reference actual files/lines in evidence.
- Provide complete code patches or framework fixes.
- Return valid JSON with: { "whatHappened": string, "whyItHappened": string, "exploitability": string, "attackerPerspective": string, "impact": string, "fixRecommendation": string, "saferExample": string, "stackGuidance": string, "sources": string[] }`.trim();

    const userPrompt = `
Title: ${args.title}
Description: ${args.description}
Evidence: ${args.evidence || ""}
Stack Hint: ${args.stackHint || ""}
`.trim();

    // Helper for exponential backoff on rate limits
    async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response | null> {
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const res = await fetch(url, options);
          
          if (res.status === 429 || res.status === 413) {
            if (i === maxRetries) return res;
            const delay = Math.pow(2, i) * 1500 + Math.random() * 500; // 1.5s, 3s, 6s + jitter
            console.warn(`[AI Analysis] Rate limited (${res.status}). Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          return res;
        } catch (err) {
          if (i === maxRetries) throw err;
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return null;
    }

    async function attempt(model: string): Promise<Partial<Explanation> | null> {
      try {
        console.log(`[AI Analysis] Attempting ${model}...`);
        const res = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.1,
            max_tokens: 1024,
            messages: [
              { role: "system", content: isRuntime ? systemPromptRuntime : systemPromptRepo },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res) return null;

        if (!res.ok) {
          const errorBody = await res.text().catch(() => "");
          console.error(`[AI Analysis] ${model} HTTP ${res.status}: ${errorBody.slice(0, 200)}`);
          return null;
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          console.error(`[AI Analysis] ${model} returned empty content`);
          return null;
        }
        console.log(`[AI Analysis] ${model} response length: ${content.length}`);
        const jsonText = extractJsonObject(content);
        if (!jsonText) {
          console.error(`[AI Analysis] ${model} could not extract JSON from response`);
          return null;
        }
        return JSON.parse(jsonText);
      } catch (err) {
        console.error(`[AI Analysis] ${model} exception:`, err);
        return null;
      }
    }

    async function attemptGroqCompound(): Promise<Partial<Explanation> | null> {
      try {
        console.log("[AI Analysis] Attempting groq/compound-mini...");
        // compound-mini does NOT support response_format or max_tokens
        const res = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "groq/compound-mini",
            messages: [
              { role: "system", content: (isRuntime ? systemPromptRuntime : systemPromptRepo) + "\n\nIMPORTANT: Return ONLY valid JSON. No text before or after the JSON object." },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!res) return null;

        if (!res.ok) {
          const errorBody = await res.text().catch(() => "");
          console.error(`[AI Analysis] compound-mini HTTP ${res.status}: ${errorBody.slice(0, 200)}`);
          return null;
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          console.error("[AI Analysis] compound-mini returned empty content");
          return null;
        }
        console.log(`[AI Analysis] compound-mini response length: ${content.length}`);
        const jsonText = extractJsonObject(content);
        if (!jsonText) {
          console.error("[AI Analysis] compound-mini could not extract JSON from response");
          return null;
        }
        return JSON.parse(jsonText);
      } catch (err) {
        console.error("[AI Analysis] compound-mini exception:", err);
        return null;
      }
    }

    try {
      let result: Partial<Explanation> | null = null;
      
      // Try the most reliable model first, then fallbacks
      result = await attempt("llama-3.3-70b-versatile");
      if (!result && isRuntime) result = await attemptGroqCompound();
      if (!result) result = await attempt("mixtral-8x7b-32768");

      if (result) {
        console.log("[AI Analysis] AI generation succeeded");
      } else {
        console.error("[AI Analysis] All models failed, using fallback");
      }

      return normalizeExplanation(result, fallback, args);
    } catch (error) {
      console.error("[AI Analysis] Generation Error:", error);
      return normalizeExplanation(null, fallback, args);
    }
  },
});

