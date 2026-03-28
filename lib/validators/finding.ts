import { z } from "zod";
export const findingFilterSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(),
  category: z.string().optional(),
  source: z.enum(["runtime", "repo", "snippet", "cve", "package", "intelligence"]).optional(),
  search: z.string().optional(),
});
export type FindingFilter = z.infer<typeof findingFilterSchema>;
