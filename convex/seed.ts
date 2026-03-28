import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create demo project
    const projectId = await ctx.db.insert("projects", {
      name: "Demo E-Commerce App",
      inputs: {
        websiteUrl: "https://demo-ecommerce.example.com",
        githubUrl: "https://github.com/demo-org/ecommerce-app",
        domain: "demo-ecommerce.example.com",
        packageName: "lodash",
        cveId: "CVE-2021-23337",
      },
      stack: "Next.js",
      createdAt: Date.now() - 3600000,
    });

    // Create scan
    const scanId = await ctx.db.insert("scans", {
      projectId,
      status: "completed",
      phase: "done",
      progress: 100,
      message: "Scan completed",
      sources: ["website", "github", "cve", "package"],
      summary: {
        totalFindings: 18,
        critical: 2,
        high: 5,
        medium: 6,
        low: 3,
        info: 2,
        overallScore: 38,
        threatLevel: "high",
      },
      startedAt: Date.now() - 3600000,
      completedAt: Date.now() - 3300000,
    });

    // Create findings
    const demoFindings = [
      { title: "Missing Content-Security-Policy Header", description: "No CSP header detected. The application lacks protection against XSS and code injection attacks via Content Security Policy.", severity: "high", category: "headers", source: "runtime", confidence: 95, remediation: "Add a strict Content-Security-Policy header.", affectedComponent: "HTTP Headers", evidence: { type: "header", raw: "Content-Security-Policy: (missing)", location: "HTTP Response Headers", context: "CSP header is not set" }, aiExplanation: { whatHappened: "The server does not send a Content-Security-Policy header in its HTTP responses.", whyItHappened: "CSP is not configured on the web server or application framework.", exploitability: "Without CSP, attackers can inject and execute malicious scripts via XSS vulnerabilities. This is a common and well-understood attack vector.", attackerPerspective: "An attacker who finds any XSS vulnerability can execute arbitrary JavaScript in users' browsers, steal session cookies, redirect users, or modify page content.", impact: "User data theft, session hijacking, phishing, cryptomining, and defacement are all possible impacts.", fixRecommendation: "Configure a strict CSP header. Start with a restrictive policy and gradually loosen it as needed.", saferExample: "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';", stackGuidance: "In Next.js, configure CSP in next.config.js using the headers() function or in middleware.ts." } },
      { title: "Missing Strict-Transport-Security Header", description: "HSTS header is not set. Browsers will not enforce HTTPS connections.", severity: "high", category: "headers", source: "runtime", confidence: 95, remediation: "Add Strict-Transport-Security header with a long max-age.", affectedComponent: "HTTP Headers" },
      { title: "Exposed API Key in Client-Side JavaScript", description: "A potential API key was found in inline JavaScript code that is sent to the browser.", severity: "critical", category: "secrets", source: "runtime", confidence: 75, remediation: "Move API keys to server-side environment variables.", affectedComponent: "Inline Script", evidence: { type: "code", raw: "const API_KEY = 'sk_live_abc123...'", location: "Inline <script>", context: "API key exposed in client-side code" }, aiExplanation: { whatHappened: "An API key with the prefix 'sk_live_' was found embedded directly in client-side JavaScript code.", whyItHappened: "The developer likely hardcoded the API key for convenience or forgot to move it to server-side environment variables.", exploitability: "Any user can view the page source and extract this key. Automated tools regularly scan websites for exposed secrets.", attackerPerspective: "An attacker can use this key to make unauthorized API calls on behalf of the application, potentially accessing sensitive data or incurring charges.", impact: "Unauthorized API access, data breaches, financial impact from API usage charges, and potential account takeover.", fixRecommendation: "1. Immediately rotate the exposed key.\n2. Move all API keys to server-side environment variables.\n3. Use server-side API routes to proxy requests.", saferExample: "// Instead of:\nconst res = await fetch(url, { headers: { 'Authorization': `Bearer ${API_KEY}` }});\n\n// Use a server-side API route:\nconst res = await fetch('/api/proxy-endpoint');", stackGuidance: "In Next.js, use server-side API routes (app/api/) or Server Actions. Only use NEXT_PUBLIC_ prefix for truly public values." } },
      { title: "Hardcoded Database Password in Config", description: "A database password was found hardcoded in a configuration file.", severity: "critical", category: "secrets", source: "repo", confidence: 80, remediation: "Use environment variables for database credentials.", affectedComponent: "config/database.ts" },
      { title: "Vulnerable Dependency: lodash@4.17.15", description: "lodash 4.17.15 has known prototype pollution vulnerability.", severity: "high", category: "dependencies", source: "repo", confidence: 90, cveIds: ["CVE-2021-23337"], remediation: "Update lodash to 4.17.21 or later.", affectedComponent: "lodash" },
      { title: "eval() Usage in Dynamic Template", description: "eval() is used to process user-provided template strings, creating a code injection risk.", severity: "critical" as const, category: "code-pattern", source: "repo", confidence: 80, remediation: "Replace eval() with a safe template engine.", affectedComponent: "lib/template-engine.ts" },
      { title: "Missing X-Frame-Options Header", description: "Without X-Frame-Options, the site can be embedded in iframes for clickjacking attacks.", severity: "medium", category: "headers", source: "runtime", confidence: 95, remediation: "Add X-Frame-Options: DENY or SAMEORIGIN." },
      { title: "CORS Wildcard Origin", description: "CORS is configured to accept requests from any origin.", severity: "medium", category: "auth", source: "repo", confidence: 70, remediation: "Restrict CORS to specific trusted domains.", affectedComponent: "server/middleware.ts" },
      { title: "Cookie Missing HttpOnly Flag", description: "Session cookie is accessible via JavaScript.", severity: "medium", category: "cookies", source: "runtime", confidence: 90, remediation: "Set HttpOnly flag on session cookies." },
      { title: "Cookie Missing Secure Flag", description: "Cookies transmitted over HTTP without Secure flag.", severity: "medium", category: "cookies", source: "runtime", confidence: 90, remediation: "Set the Secure flag on all sensitive cookies." },
      { title: "Insecure Password Hashing (MD5)", description: "Passwords are being hashed with MD5 which is cryptographically weak.", severity: "high", category: "auth", source: "repo", confidence: 85, remediation: "Switch to bcrypt, argon2, or scrypt.", affectedComponent: "services/auth.ts" },
      { title: "dangerouslySetInnerHTML Usage", description: "React's dangerouslySetInnerHTML is used with user-provided content.", severity: "high", category: "input-validation", source: "repo", confidence: 65, remediation: "Sanitize HTML with DOMPurify before rendering.", affectedComponent: "components/RichText.tsx" },
      { title: "Missing Referrer-Policy Header", description: "Referrer-Policy header is not set, potentially leaking URL information.", severity: "low", category: "headers", source: "runtime", confidence: 95, remediation: "Add Referrer-Policy: strict-origin-when-cross-origin." },
      { title: "Technology Stack Fingerprinted", description: "Detected: Next.js, React, Tailwind CSS. Technology details aid attacker reconnaissance.", severity: "info", category: "technologies", source: "runtime", confidence: 75, affectedComponent: "Next.js, React, Tailwind CSS" },
      { title: "Server Version Disclosed", description: "Server header reveals: nginx/1.21.6", severity: "low", category: "headers", source: "runtime", confidence: 90, remediation: "Remove or obfuscate the Server header." },
      { title: "Exposed GraphQL Endpoint", description: "/graphql endpoint is publicly accessible without authentication.", severity: "medium", category: "endpoints", source: "runtime", confidence: 85, remediation: "Add authentication to GraphQL endpoint.", affectedComponent: "/graphql" },
      { title: "Public robots.txt Exposed", description: "robots.txt reveals application structure and hidden paths.", severity: "info", category: "public-files", source: "runtime", confidence: 90, affectedComponent: "/robots.txt" },
      { title: "SSL Verification Disabled in HTTP Client", description: "rejectUnauthorized is set to false, disabling SSL certificate verification.", severity: "medium", category: "config", source: "repo", confidence: 75, remediation: "Enable SSL verification in production.", affectedComponent: "lib/http-client.ts" },
    ];

    const findingIds = [];
    for (const f of demoFindings) {
      const id = await ctx.db.insert("findings", { scanId, ...f });
      findingIds.push(id);
    }

    // Create intelligence items
    const demoIntelligence = [
      { type: "cve", title: "CVE-2021-23337: Lodash Command Injection", summary: "Lodash versions prior to 4.17.21 are vulnerable to Command Injection via the template function. This allows attackers to execute arbitrary commands when user input is passed to the template function.", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-23337", source: "exa", severity: "high", relatedCves: ["CVE-2021-23337"], packageName: "lodash", tags: ["cve", "lodash", "command-injection"] },
      { type: "exploit", title: "Prototype Pollution in Lodash: Exploit Analysis", summary: "Detailed analysis of the prototype pollution vulnerability chain in lodash, including proof-of-concept scenarios and real-world impact assessment for Node.js applications.", url: "https://security.snyk.io/vuln/SNYK-JS-LODASH-1018905", source: "exa", severity: "high", tags: ["exploit", "prototype-pollution"] },
      { type: "advisory", title: "GitHub Advisory: GHSA-35jh-r3h4-6jhm", summary: "GitHub Security Advisory for lodash command injection vulnerability. All lodash versions before 4.17.21 are affected. Immediate upgrade recommended.", url: "https://github.com/advisories/GHSA-35jh-r3h4-6jhm", source: "github", severity: "high", relatedCves: ["CVE-2021-23337"], tags: ["advisory", "github"] },
      { type: "blog", title: "CSP Best Practices for Modern Web Applications", summary: "Comprehensive guide on implementing Content Security Policy headers effectively, covering nonce-based CSP, strict-dynamic, and common pitfalls when deploying CSP in production Next.js apps.", url: "https://web.dev/csp/", source: "exa", tags: ["csp", "best-practices", "headers"] },
      { type: "patch", title: "Lodash 4.17.21 Release Notes", summary: "Security patch release addressing CVE-2021-23337 and CVE-2020-28500. All applications using lodash should upgrade to this version or later.", url: "https://github.com/lodash/lodash/releases/tag/4.17.21", source: "github", relatedCves: ["CVE-2021-23337", "CVE-2020-28500"], tags: ["patch", "release"] },
      { type: "research", title: "OWASP Top 10 2021: Injection Attacks", summary: "Injection flaws remain the #1 web application security risk. This includes SQL injection, NoSQL injection, OS command injection, and LDAP injection.", url: "https://owasp.org/Top10/A03_2021-Injection/", source: "exa", tags: ["owasp", "injection", "research"] },
      { type: "changelog", title: "Next.js Security Headers Configuration", summary: "Official Next.js documentation on configuring security headers including CSP, HSTS, X-Frame-Options, and other security-related HTTP headers via next.config.js.", url: "https://nextjs.org/docs/advanced-features/security-headers", source: "exa", tags: ["nextjs", "headers", "documentation"] },
      { type: "advisory", title: "NPM Advisory: express-session Memory Leak", summary: "Using the default in-memory session store in production can lead to memory leaks and is not suitable for production environments.", source: "apify", severity: "medium", tags: ["npm", "advisory", "session"] },
    ];

    for (const intel of demoIntelligence) {
      await ctx.db.insert("intelligence", { scanId, ...intel });
    }

    // Create remediations
    const demoRemediations = [
      { findingId: findingIds[0], title: "Implement Content-Security-Policy", description: "Add a strict CSP header", status: "pending", priority: "critical", fixSuggestion: "Add CSP header in next.config.js or middleware", saferCode: "// next.config.js\nconst securityHeaders = [{ key: 'Content-Security-Policy', value: \"default-src 'self'; script-src 'self'\" }];", effort: "moderate", category: "headers" },
      { findingId: findingIds[2], title: "Rotate and Secure API Keys", description: "Remove exposed API key and use env vars", status: "pending", priority: "critical", fixSuggestion: "1. Rotate the compromised key immediately.\n2. Move to NEXT_PUBLIC_ or server-side env vars.", effort: "minimal", category: "secrets" },
      { findingId: findingIds[3], title: "Remove Hardcoded Database Password", description: "Use environment variables for DB credentials", status: "in-progress", priority: "critical", fixSuggestion: "Replace hardcoded values with process.env references", effort: "minimal", category: "secrets" },
      { findingId: findingIds[4], title: "Update lodash to 4.17.21+", description: "Update vulnerable lodash dependency", status: "pending", priority: "high", fixSuggestion: "Run: npm update lodash", effort: "minimal", category: "dependencies" },
      { findingId: findingIds[5], title: "Replace eval() with Safe Alternative", description: "Remove eval() usage", status: "pending", priority: "critical", fixSuggestion: "Use a template engine like handlebars/mustache instead of eval()", effort: "moderate", category: "code-pattern" },
      { findingId: findingIds[10], title: "Switch to bcrypt for Password Hashing", description: "Replace MD5 with bcrypt", status: "pending", priority: "high", fixSuggestion: "npm install bcrypt && replace MD5 implementation", saferCode: "import bcrypt from 'bcrypt';\nconst hash = await bcrypt.hash(password, 12);", effort: "moderate", category: "auth" },
    ];

    for (const rem of demoRemediations) {
      await ctx.db.insert("remediations", { scanId, ...rem });
    }

    // Create report
    await ctx.db.insert("reports", {
      scanId,
      title: "Security Audit Report - Demo E-Commerce App",
      executiveSummary: "This security audit of the Demo E-Commerce App identified 18 findings across runtime and repository analysis. The overall security score is 38/100, indicating HIGH risk. 2 critical findings require immediate attention: an exposed API key in client-side code and hardcoded database credentials. 5 high-severity issues including missing security headers, vulnerable dependencies, and weak password hashing should be addressed promptly. The application shows common security anti-patterns typical of AI-generated code that prioritizes functionality over security.",
      generatedAt: Date.now(),
      status: "ready",
      format: "markdown",
      sections: [
        { id: "s1", title: "Executive Summary", content: "High-risk security posture with 18 findings...", type: "summary", order: 1 },
        { id: "s2", title: "Critical Findings", content: "2 critical findings identified requiring immediate action...", type: "findings", order: 2 },
        { id: "s3", title: "Threat Intelligence", content: "8 intelligence items gathered from multiple sources...", type: "intelligence", order: 3 },
        { id: "s4", title: "Remediation Plan", content: "6 prioritized remediation items...", type: "remediation", order: 4 },
        { id: "s5", title: "References", content: "CVE databases, OWASP, MDN, and vendor documentation...", type: "references", order: 5 },
      ],
    });

    return { projectId, scanId };
  },
});
