export function remediationPrompt(finding: { title: string; description: string; category: string }, stack?: string): Array<{ role: string; content: string }> {
  return [
    { role: "system", content: "You are a senior security engineer. Provide actionable remediation guidance with code examples." },
    { role: "user", content: `Provide remediation for: ${finding.title}\nCategory: ${finding.category}\nDescription: ${finding.description}${stack ? `\nTech Stack: ${stack}` : ""}\n\nInclude:\n1. Step-by-step fix\n2. Code example\n3. Configuration changes\n4. Verification steps` },
  ];
}
