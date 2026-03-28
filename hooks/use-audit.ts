"use client";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useState } from "react";

export function useAudit() {
  const createProject = useMutation(api.projects.create);
  const runFullAudit = useAction(api.auditOrchestrator.runFullAudit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAudit = useCallback(async (inputs: {
    websiteUrl?: string;
    githubUrl?: string;
    domain?: string;
    cveId?: string;
    packageName?: string;
    codeSnippet?: string;
  }, stack?: string) => {
    setIsSubmitting(true);
    try {
      const sources: string[] = [];
      if (inputs.websiteUrl) sources.push("website");
      if (inputs.githubUrl) sources.push("github");
      if (inputs.domain) sources.push("domain");
      if (inputs.cveId) sources.push("cve");
      if (inputs.packageName) sources.push("package");
      if (inputs.codeSnippet) sources.push("snippet");

      const projectId = await createProject({
        name: inputs.websiteUrl || inputs.githubUrl || inputs.domain || inputs.packageName || "Audit",
        inputs,
        stack,
      });

      const scanId = await runFullAudit({ projectId, sources, inputs });
      return scanId;
    } finally {
      setIsSubmitting(false);
    }
  }, [createProject, runFullAudit]);

  return { submitAudit, isSubmitting };
}
