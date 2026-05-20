import { NextResponse } from "next/server";
import { getFundAdvisoryRagProviderInfo } from "@/lib/asesoria/fundAdvisoryRag";
import { getBrainboxConfig, brainboxHealthCheck } from "@/lib/asesoria/brainboxClient";

export async function GET() {
  const info = getFundAdvisoryRagProviderInfo();
  
  const cfg = getBrainboxConfig();
  let healthy = false;
  let healthError: string | null = null;

  if (cfg) {
    try {
      await brainboxHealthCheck(cfg);
      healthy = true;
    } catch (err) {
      healthError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ...info,
    healthy,
    healthError,
  });
}
