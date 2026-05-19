import { NextResponse } from "next/server";
import {
  getFundAdvisoryRagProvider,
  searchFundAdvisoryRag,
  getIndexStats,
  buildVectorIndex,
} from "@/lib/asesoria/fundAdvisoryRag";
import { BrainboxApiError } from "@/lib/asesoria/brainboxClient";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { query?: string; topK?: number };
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "query requerido" }, { status: 400 });
    }

    const result = await searchFundAdvisoryRag(query, { topK: body.topK });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fund-advisory-rag]", err);
    if (err instanceof BrainboxApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code, provider: getFundAdvisoryRagProvider() },
        { status: err.status ?? 502 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "build") {
    try {
      await buildVectorIndex();
      const stats = getIndexStats();
      return NextResponse.json({ success: true, ...stats });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }

  const provider = getFundAdvisoryRagProvider();
  const stats = getIndexStats();
  const providerConfig = process.env.FUND_ADVISORY_RAG_PROVIDER?.trim() || "vector (default)";

  console.log(`[fund-advisory-rag] Estado: ${providerConfig} | chunks: ${stats.chunks} | ready: ${stats.ready}`);

  return NextResponse.json({
    provider,
    providerConfig,
    vectorIndex: stats,
  });
}
