import { NextResponse } from "next/server";
import { searchFundAdvisoryRag } from "@/lib/asesoria/fundAdvisoryRag";
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
        { error: err.message, code: err.code, provider: "brainbox" },
        { status: err.status ?? 502 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    provider: "brainbox",
    message: "RAG con BrainBox activo",
  });
}
