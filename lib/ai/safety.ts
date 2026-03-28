export function sanitizeAIOutput(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (match) => match) // preserve code blocks
    .replace(/<script[\s\S]*?<\/script>/gi, "[script removed]")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "[iframe removed]")
    .replace(/javascript:/gi, "[removed]")
    .replace(/on\w+\s*=\s*"/gi, "[event handler removed]");
}

export function ensureSafeLanguage(text: string): string {
  // Remove any actual exploit payloads — keep explanations safe
  return text
    .replace(/'; DROP TABLE/gi, "[SQL payload redacted]")
    .replace(/<script>alert/gi, "[XSS payload redacted]")
    .replace(/\x00/g, "");
}
