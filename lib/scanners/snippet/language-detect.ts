const LANGUAGE_EXTENSIONS: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java", kt: "kotlin",
  cs: "csharp", cpp: "cpp", c: "c", php: "php", swift: "swift",
  html: "html", css: "css", sql: "sql", sh: "bash", yml: "yaml", yaml: "yaml",
  json: "json", xml: "xml", md: "markdown",
};

const LANGUAGE_PATTERNS: Array<{ pattern: RegExp; language: string }> = [
  { pattern: /^import\s+.*\s+from\s+['"]|^export\s+(default\s+)?/m, language: "typescript" },
  { pattern: /^const\s+\w+\s*[:=]|^let\s+\w+\s*[:=]|^function\s+\w+/m, language: "javascript" },
  { pattern: /^def\s+\w+|^class\s+\w+|^import\s+\w+/m, language: "python" },
  { pattern: /^package\s+\w+|^func\s+\w+|^import\s+\(/m, language: "go" },
  { pattern: /^pub\s+fn|^use\s+\w+|^mod\s+\w+/m, language: "rust" },
  { pattern: /^public\s+class|^import\s+java\./m, language: "java" },
  { pattern: /<\?php/m, language: "php" },
  { pattern: /^<!DOCTYPE\s+html|^<html/m, language: "html" },
  { pattern: /^SELECT\s+|^INSERT\s+|^CREATE\s+TABLE/mi, language: "sql" },
];

export function detectLanguage(code: string, filename?: string): string {
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext && LANGUAGE_EXTENSIONS[ext]) return LANGUAGE_EXTENSIONS[ext];
  }
  for (const { pattern, language } of LANGUAGE_PATTERNS) {
    if (pattern.test(code)) return language;
  }
  return "unknown";
}
