import { z } from "zod";
export const intelligenceFilterSchema = z.object({
  type: z.enum(["cve", "exploit", "advisory", "blog", "patch", "changelog", "research"]).optional(),
  source: z.enum(["exa", "apify", "github", "manual"]).optional(),
  search: z.string().optional(),
});
export type IntelligenceFilter = z.infer<typeof intelligenceFilterSchema>;
