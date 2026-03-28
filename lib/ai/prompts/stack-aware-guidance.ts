export function stackAwareGuidancePrompt(finding: { title: string; description: string }, stack: string): Array<{ role: string; content: string }> {
  return [
    { role: "system", content: `You are a security expert specializing in ${stack}. Provide stack-specific security guidance.` },
    { role: "user", content: `For a ${stack} application with this finding:\n${finding.title}: ${finding.description}\n\nProvide ${stack}-specific:\n1. Why this is especially relevant to ${stack}\n2. Framework-specific fix\n3. Best practices for ${stack}\n4. Recommended libraries/tools` },
  ];
}
