import { z } from "zod";
export const reportExportSchema = z.object({
  scanId: z.string(),
  format: z.enum(["pdf", "markdown", "json"]),
  includeEvidence: z.boolean().default(true),
  includeRemediation: z.boolean().default(true),
});
export type ReportExportSchema = z.infer<typeof reportExportSchema>;
