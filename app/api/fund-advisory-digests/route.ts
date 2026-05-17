import { NextResponse } from "next/server";
import { collectAllFundDigestsMarkdown } from "@/lib/asesoria/collectFundDigestMarkdown";

export async function GET() {
  try {
    const out = collectAllFundDigestsMarkdown();
    return NextResponse.json(out);
  } catch (err) {
    console.error("[fund-advisory-digests]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
