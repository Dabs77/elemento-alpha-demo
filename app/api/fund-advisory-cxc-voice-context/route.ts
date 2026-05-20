import { NextResponse } from "next/server";
import { buildFundAdvisoryCxCVoiceContext } from "@/lib/asesoria/fundAdvisoryCxCVoiceContext";

export async function GET() {
  try {
    const result = buildFundAdvisoryCxCVoiceContext();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fund-advisory-cxc-voice-context]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
