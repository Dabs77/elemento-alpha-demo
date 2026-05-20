import { NextResponse } from "next/server";
import { buildFundAdvisoryFullCorpusVoiceContext } from "@/lib/asesoria/fundAdvisoryFullCorpusVoiceContext";

export async function GET() {
  try {
    const result = buildFundAdvisoryFullCorpusVoiceContext();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fund-advisory-full-corpus-voice-context]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
