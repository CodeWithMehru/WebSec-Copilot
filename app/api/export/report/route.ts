import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { scanId, format } = await req.json();
    if (!scanId) return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    // Placeholder — export logic is handled client-side for PDF/MD/JSON
    return NextResponse.json({ success: true, message: `Export in ${format || "json"} format initiated`, scanId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
