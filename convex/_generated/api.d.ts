/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiAnalysis from "../aiAnalysis.js";
import type * as apify from "../apify.js";
import type * as auditHelpers from "../auditHelpers.js";
import type * as auditOrchestrator from "../auditOrchestrator.js";
import type * as cveAnalyzer from "../cveAnalyzer.js";
import type * as dashboard from "../dashboard.js";
import type * as exa from "../exa.js";
import type * as files from "../files.js";
import type * as findings from "../findings.js";
import type * as github from "../github.js";
import type * as intelligence from "../intelligence.js";
import type * as packageAnalyzer from "../packageAnalyzer.js";
import type * as projects from "../projects.js";
import type * as remediations from "../remediations.js";
import type * as repoScanner from "../repoScanner.js";
import type * as reports from "../reports.js";
import type * as runtimeScanner from "../runtimeScanner.js";
import type * as scans from "../scans.js";
import type * as scoring from "../scoring.js";
import type * as seed from "../seed.js";
import type * as snippetScanner from "../snippetScanner.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiAnalysis: typeof aiAnalysis;
  apify: typeof apify;
  auditHelpers: typeof auditHelpers;
  auditOrchestrator: typeof auditOrchestrator;
  cveAnalyzer: typeof cveAnalyzer;
  dashboard: typeof dashboard;
  exa: typeof exa;
  files: typeof files;
  findings: typeof findings;
  github: typeof github;
  intelligence: typeof intelligence;
  packageAnalyzer: typeof packageAnalyzer;
  projects: typeof projects;
  remediations: typeof remediations;
  repoScanner: typeof repoScanner;
  reports: typeof reports;
  runtimeScanner: typeof runtimeScanner;
  scans: typeof scans;
  scoring: typeof scoring;
  seed: typeof seed;
  snippetScanner: typeof snippetScanner;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
