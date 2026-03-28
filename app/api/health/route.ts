import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    uptime: process.uptime(),
    services: {
      convex: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      exa: !!process.env.EXA_API_KEY,
      apify: !!process.env.APIFY_API_TOKEN,
      github: !!process.env.GITHUB_TOKEN,
      ai: !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY),
    },
  });
}
