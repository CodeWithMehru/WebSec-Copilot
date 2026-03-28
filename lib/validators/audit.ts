import { z } from "zod";

export const auditInputSchema = z.object({
  websiteUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  domain: z.string().optional().or(z.literal("")),
  cveId: z.string().regex(/^CVE-\d{4}-\d{4,}$/i).optional().or(z.literal("")),
  packageName: z.string().optional().or(z.literal("")),
  codeSnippet: z.string().optional().or(z.literal("")),
  stack: z.string().optional(),
});

export type AuditInputSchema = z.infer<typeof auditInputSchema>;

export function validateAuditInput(input: AuditInputSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const hasAnyInput = input.websiteUrl || input.githubUrl || input.domain || input.cveId || input.packageName || input.codeSnippet;
  if (!hasAnyInput) errors.push("At least one input is required");
  return { valid: errors.length === 0, errors };
}
