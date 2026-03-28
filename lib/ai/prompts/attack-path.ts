export function attackPathPrompt(findings: Array<{ title: string; severity: string; category: string }>): Array<{ role: string; content: string }> {
  const list = findings.map(f => `- [${f.severity.toUpperCase()}] ${f.title} (${f.category})`).join("\n");
  return [
    { role: "system", content: "You are a penetration testing expert. Describe potential attack paths in safe, high-level language suitable for a security report." },
    { role: "user", content: `Based on these findings, describe potential attack chains an attacker could use:\n\n${list}\n\nDescribe 2-3 attack paths in high-level terms. Do NOT include actual exploit code.` },
  ];
}
