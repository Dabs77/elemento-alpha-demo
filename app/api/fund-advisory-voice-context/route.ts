import { NextResponse } from "next/server";
import { buildFundAdvisoryVoiceContext } from "@/lib/asesoria/fundAdvisoryVoiceContext";

export async function GET() {
  try {
    const result = buildFundAdvisoryVoiceContext();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fund-advisory-voice-context]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
