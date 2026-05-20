import { NextResponse } from "next/server";
import { buildFundAdvisoryBothFundsVoiceContext } from "@/lib/asesoria/fundAdvisoryBothFundsVoiceContext";

export async function GET() {
  try {
    const result = buildFundAdvisoryBothFundsVoiceContext();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fund-advisory-both-voice-context]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
