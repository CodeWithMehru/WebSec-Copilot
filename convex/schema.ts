import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    inputs: v.object({
      websiteUrl: v.optional(v.string()),
      githubUrl: v.optional(v.string()),
      domain: v.optional(v.string()),
      cveId: v.optional(v.string()),
      packageName: v.optional(v.string()),
      codeSnippet: v.optional(v.string()),
    }),
    stack: v.optional(v.string()),
    createdAt: v.number(),
  }),

  scans: defineTable({
    projectId: v.id("projects"),
    status: v.string(),
    phase: v.string(),
    progress: v.number(),
    message: v.string(),
    sources: v.array(v.string()),
    summary: v.optional(v.object({
      totalFindings: v.number(),
      critical: v.number(),
      high: v.number(),
      medium: v.number(),
      low: v.number(),
      info: v.number(),
      overallScore: v.number(),
      threatLevel: v.string(),
    })),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  findings: defineTable({
    scanId: v.id("scans"),
    title: v.string(),
    description: v.string(),
    severity: v.string(),
    category: v.string(),
    source: v.string(),
    evidence: v.optional(v.object({
      type: v.string(),
      raw: v.string(),
      location: v.optional(v.string()),
      lineNumber: v.optional(v.number()),
      context: v.optional(v.string()),
    })),
    aiExplanation: v.optional(v.object({
      whatHappened: v.string(),
      whyItHappened: v.string(),
      exploitability: v.string(),
      attackerPerspective: v.string(),
      impact: v.string(),
      fixRecommendation: v.string(),
      saferExample: v.optional(v.string()),
      stackGuidance: v.optional(v.string()),
      sources: v.optional(v.array(v.string())),
    })),
    cveIds: v.optional(v.array(v.string())),
    affectedComponent: v.optional(v.string()),
    confidence: v.number(),
    remediation: v.optional(v.string()),
    references: v.optional(v.array(v.string())),
  }).index("by_scan", ["scanId"])
    .index("by_severity", ["severity"]),

  intelligence: defineTable({
    scanId: v.id("scans"),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    url: v.optional(v.string()),
    source: v.string(),
    severity: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    relatedCves: v.optional(v.array(v.string())),
    relatedFindings: v.optional(v.array(v.string())),
    packageName: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    raw: v.optional(v.string()),
  }).index("by_scan", ["scanId"])
    .index("by_type", ["type"]),

  remediations: defineTable({
    scanId: v.id("scans"),
    findingId: v.id("findings"),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    fixSuggestion: v.string(),
    saferCode: v.optional(v.string()),
    effort: v.string(),
    category: v.string(),
  }).index("by_scan", ["scanId"])
    .index("by_finding", ["findingId"]),

  reports: defineTable({
    scanId: v.id("scans"),
    title: v.string(),
    executiveSummary: v.string(),
    generatedAt: v.number(),
    status: v.string(),
    format: v.string(),
    sections: v.array(v.object({
      id: v.string(),
      title: v.string(),
      content: v.string(),
      type: v.string(),
      order: v.number(),
    })),
  }).index("by_scan", ["scanId"]),
});