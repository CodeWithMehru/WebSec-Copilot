export function explainFindingPrompt(finding: {
  title: string;
  description: string;
  severity: string;
  category: string;
  evidence?: { raw: string; location?: string };
}): Array<{ role: string; content: string }> {
  return [
    {
      role: "system",
      content: `You are a senior application security engineer. Explain security findings in clear, professional language suitable for developers and executives. Structure your response with these sections:
## What Happened
## Why It Happened  
## Exploitability
## Attacker Perspective
## Impact
## Fix Recommendation
## Safer Example`,
    },
    {
      role: "user",
      content: `Explain this security finding:

**Title:** ${finding.title}
**Severity:** ${finding.severity}
**Category:** ${finding.category}
**Description:** ${finding.description}
${finding.evidence ? `**Evidence:** ${finding.evidence.raw}\n**Location:** ${finding.evidence.location || "N/A"}` : ""}

Provide a thorough but concise explanation. Use safe, high-level language for exploitability and attacker perspective — do not include actual exploit code.`,
    },
  ];
}
