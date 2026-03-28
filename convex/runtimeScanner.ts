// convex/runtimeScanner.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

function detectRuntimeStack(headers: Headers, bodyText: string): string {
  const xPoweredBy = headers.get("X-Powered-By")?.toLowerCase() || "";
  const body = bodyText.toLowerCase();

  if (xPoweredBy.includes("next.js") || body.includes("/_next/") || body.includes("__next_data__")) {
    return "nextjs";
  }

  if (xPoweredBy.includes("express") || body.includes("express")) {
    return "express";
  }

  return "";
}

function buildEvidenceContext(
  stackHint: string,
  headers: Headers,
  bodyText: string,
  note: string
): string {
  const parts = [
    stackHint ? `stack=${stackHint}` : "",
    headers.get("X-Powered-By") ? `x-powered-by=${headers.get("X-Powered-By")}` : "",
    headers.get("Server") ? `server=${headers.get("Server")}` : "",
    bodyText.includes("__NEXT_DATA__") ? "body=nextjs-fingerprint" : "",
    bodyText.includes("/_next/") ? "body=nextjs-assets" : "",
    bodyText.includes("react-refresh") ? "body=react-refresh" : "",
    note,
  ].filter(Boolean);

  return parts.join(" | ");
}

export const scanRuntime = action({
  args: {
    scanId: v.id("scans"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const findings: Array<{
      scanId: typeof args.scanId;
      title: string;
      description: string;
      severity: string;
      category: string;
      source: string;
      confidence: number;
      remediation?: string;
      affectedComponent?: string;
      evidence?: {
        type: string;
        raw: string;
        location?: string;
        lineNumber?: number;
        context?: string;
      };
    }> = [];

    try {
      let actualUrl = args.url;
      if (!actualUrl.startsWith("http")) actualUrl = `https://${actualUrl}`;

      const res = await fetch(actualUrl, {
        method: "GET",
        headers: {
          "User-Agent": "WebSec Copilot Security Scanner",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      const bodyText = await res.text();
      const stackHint = detectRuntimeStack(res.headers, bodyText);

      if (res.url.startsWith("http://")) {
        findings.push({
          scanId: args.scanId,
          title: "Plaintext HTTP Connection",
          description: "Target allows plaintext HTTP connections without forcing HTTPS.",
          severity: "high",
          category: "tls",
          source: "runtime",
          confidence: 100,
          remediation: "Enforce HTTPS with redirect rules and HSTS.",
          evidence: {
            type: "response",
            raw: `Final URL: ${res.url}`,
            context: buildEvidenceContext(stackHint, res.headers, bodyText, "plaintext-http"),
          },
        });
      }

      const secHeaders = [
        {
          name: "Strict-Transport-Security",
          severity: "high",
          desc: "No Strict-Transport-Security header found.",
          remediation: "Add HSTS so browsers always use HTTPS after the first secure visit.",
        },
        {
          name: "Content-Security-Policy",
          severity: "high",
          desc: "No Content-Security-Policy header found.",
          remediation: "Add CSP to control which scripts, styles, images, and frames the browser can load.",
        },
        {
          name: "X-Content-Type-Options",
          severity: "medium",
          desc: "X-Content-Type-Options nosniff is missing.",
          remediation: "Set X-Content-Type-Options: nosniff to stop MIME sniffing.",
        },
        {
          name: "X-Frame-Options",
          severity: "medium",
          desc: "X-Frame-Options is missing and the page may be clickjackable.",
          remediation: "Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking.",
        },
        {
          name: "Referrer-Policy",
          severity: "low",
          desc: "Referrer-Policy missing.",
          remediation: "Set a referrer policy such as strict-origin-when-cross-origin.",
        },
        {
          name: "Permissions-Policy",
          severity: "low",
          desc: "Permissions-Policy missing.",
          remediation: "Restrict browser features such as camera, microphone, and geolocation.",
        },
      ] as const;

      for (const h of secHeaders) {
        const headerValue = res.headers.get(h.name);
        if (!headerValue) {
          findings.push({
            scanId: args.scanId,
            title: `Missing ${h.name}`,
            description: h.desc,
            severity: h.severity,
            category: "headers",
            source: "runtime",
            confidence: 95,
            remediation: h.remediation,
            evidence: {
              type: "header",
              raw: `Missing header: ${h.name}`,
              context: buildEvidenceContext(
                stackHint,
                res.headers,
                bodyText,
                `target=${actualUrl}; missing=${h.name}`
              ),
            },
          });
        }
      }

      const cookies = res.headers.get("Set-Cookie");
      if (cookies) {
        const cArr = cookies.split(/,(?=[^ ])/);
        for (const c of cArr) {
          const cookieName = c.split("=")[0]?.trim() || "unknown";

          if (!c.toLowerCase().includes("secure")) {
            findings.push({
              scanId: args.scanId,
              title: "Insecure Cookie Flag",
              description: `Cookie lacks Secure flag: ${cookieName}`,
              severity: "high",
              category: "cookies",
              source: "runtime",
              confidence: 90,
              remediation: "Set the Secure flag on cookies.",
              evidence: {
                type: "header",
                raw: `Set-Cookie: ${cookieName}`,
                context: buildEvidenceContext(stackHint, res.headers, bodyText, "cookie-missing-secure"),
              },
            });
          }

          if (!c.toLowerCase().includes("httponly")) {
            findings.push({
              scanId: args.scanId,
              title: "Missing HttpOnly Cookie",
              description: `Cookie lacks HttpOnly flag: ${cookieName}`,
              severity: "medium",
              category: "cookies",
              source: "runtime",
              confidence: 90,
              remediation: "Set HttpOnly on cookies not required by client-side scripts.",
              evidence: {
                type: "header",
                raw: `Set-Cookie: ${cookieName}`,
                context: buildEvidenceContext(stackHint, res.headers, bodyText, "cookie-missing-httponly"),
              },
            });
          }

          if (!c.toLowerCase().includes("samesite")) {
            findings.push({
              scanId: args.scanId,
              title: "Missing SameSite Attribute",
              description: `Cookie lacks SameSite attribute: ${cookieName}`,
              severity: "low",
              category: "cookies",
              source: "runtime",
              confidence: 90,
              remediation: "Set SameSite=Lax or SameSite=Strict where appropriate.",
              evidence: {
                type: "header",
                raw: `Set-Cookie: ${cookieName}`,
                context: buildEvidenceContext(stackHint, res.headers, bodyText, "cookie-missing-samesite"),
              },
            });
          }
        }
      }

      const poweredBy = res.headers.get("X-Powered-By");
      if (poweredBy) {
        findings.push({
          scanId: args.scanId,
          title: "Exposed X-Powered-By Header",
          description: `Server exposes technology stack: ${poweredBy}`,
          severity: "info",
          category: "config",
          source: "runtime",
          confidence: 100,
          remediation: "Remove or suppress X-Powered-By header.",
          evidence: {
            type: "header",
            raw: `X-Powered-By: ${poweredBy}`,
            context: buildEvidenceContext(stackHint, res.headers, bodyText, "x-powered-by-exposed"),
          },
        });
      }

      const serverHeader = res.headers.get("Server");
      if (serverHeader && /[0-9]/.test(serverHeader)) {
        findings.push({
          scanId: args.scanId,
          title: "Server Version Exposure",
          description: `Server header exposes version information: ${serverHeader}`,
          severity: "low",
          category: "config",
          source: "runtime",
          confidence: 100,
          remediation: "Hide version identifiers from the Server header.",
          evidence: {
            type: "header",
            raw: `Server: ${serverHeader}`,
            context: buildEvidenceContext(stackHint, res.headers, bodyText, "server-version-exposure"),
          },
        });
      }

      if (bodyText.includes("react-refresh") || bodyText.includes("__NEXT_DATA__")) {
        findings.push({
          scanId: args.scanId,
          title: "Framework Fingerprint: Next.js/React",
          description: "Target reveals frontend framework details in page output.",
          severity: "info",
          category: "config",
          source: "runtime",
          confidence: 85,
          evidence: {
            type: "body",
            raw: bodyText.includes("__NEXT_DATA__") ? "__NEXT_DATA__ present" : "react-refresh detected",
            context: buildEvidenceContext(stackHint || "nextjs", res.headers, bodyText, "framework-fingerprint"),
          },
        });
      }

      const pathExposure = bodyText.match(/(?:\/var\/www\/|\/home\/user\/[^\s'"]+)/);
      if (pathExposure?.[0]) {
        findings.push({
          scanId: args.scanId,
          title: "Local Path Exposure",
          description: "Server local filesystem path is exposed in response content.",
          severity: "low",
          category: "config",
          source: "runtime",
          confidence: 80,
          evidence: {
            type: "snippet",
            raw: pathExposure[0],
            context: buildEvidenceContext(stackHint, res.headers, bodyText, "local-path-exposure"),
          },
        });
      }

      const probeTarget = async (
        path: string,
        type: string,
        severity: string,
        name: string
      ) => {
        try {
          const pUrl = new URL(path, actualUrl).href;
          const pRes = await fetch(pUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });

          if (pRes.ok && pRes.status !== 403 && pRes.status !== 404) {
            findings.push({
              scanId: args.scanId,
              title: `${name} Accessible`,
              description: `A potentially sensitive ${type} endpoint/file is publicly accessible at ${path}.`,
              severity,
              category: "config",
              source: "runtime",
              confidence: 90,
              affectedComponent: path,
              remediation: `Restrict or review public access to ${path}.`,
              evidence: {
                type: "probe",
                raw: `Accessible path: ${path}`,
                context: buildEvidenceContext(stackHint, res.headers, bodyText, `probe=${path}`),
              },
            });
          }
        } catch {
          // ignore background probe failures
        }
      };

      await Promise.all([
        probeTarget("/.env", "environment file", "critical", ".env File"),
        probeTarget("/.git/config", "git metadata", "critical", ".git Config"),
        probeTarget("/server-status", "server status page", "high", "Server Status"),
        probeTarget("/phpinfo.php", "diagnostic page", "high", "phpinfo"),
        probeTarget("/robots.txt", "informational file", "info", "robots.txt"),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown runtime scan error";
      const lower = message.toLowerCase();

      if (
        lower.includes("certificate") ||
        lower.includes("cert") ||
        lower.includes("ssl") ||
        lower.includes("tls") ||
        lower.includes("self-signed") ||
        lower.includes("expired")
      ) {
        findings.push({
          scanId: args.scanId,
          title: "TLS/Certificate Error",
          description: `Target appears to have an invalid or expired TLS certificate: ${message}`,
          severity: "critical",
          category: "tls",
          source: "runtime",
          confidence: 100,
          remediation:
            "Replace the certificate with a valid certificate from a trusted CA and deploy the full chain.",
        });
      } else {
        findings.push({
          scanId: args.scanId,
          title: "Target Unavailable",
          description: `Runtime scanner was unable to access the target completely: ${message}`,
          severity: "info",
          category: "scanner-error",
          source: "runtime",
          confidence: 100,
          remediation:
            "Check whether the target is down, blocking automated requests, or timing out.",
        });
      }
    }

    if (findings.length > 0) {
      for (let i = 0; i < findings.length; i += 20) {
        await ctx.runMutation(api.findings.createBatch, {
          findings: findings.slice(i, i + 20),
        });
      }
    }

    return findings.length;
  },
});
