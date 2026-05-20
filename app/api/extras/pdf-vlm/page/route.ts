import { NextRequest, NextResponse } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { analyzePdfPagePngWithGemini } from "@/lib/onboarding/pdfVlmGemini";

export const runtime = "nodejs";

/** Vercel Pro: 300s; Hobby se recorta a 60s. */
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Sin clave de Gemini en el servidor. Define GEMINI_API_KEY o NEXT_PUBLIC_GEMINI_API_KEY.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const pageNumber = Number(formData.get("pageNumber"));
    const totalPages = Number(formData.get("totalPages"));
    const fileNameRaw = formData.get("fileName");
    const feedbackRaw = formData.get("feedback");

    const fileName =
      typeof fileNameRaw === "string" && fileNameRaw.trim() ? fileNameRaw.trim() : "documento.pdf";
    const feedback =
      typeof feedbackRaw === "string" && feedbackRaw.trim() ? feedbackRaw.trim() : undefined;
    
    const maxTokensRaw = formData.get("maxTokens");
    const maxTokens = maxTokensRaw ? Number(maxTokensRaw) : undefined;
    
    const paraphraseModeRaw = formData.get("paraphraseMode");
    const paraphraseMode = paraphraseModeRaw === "true" || paraphraseModeRaw === "1";

    if (!(image instanceof Blob) || image.size === 0) {
      return NextResponse.json({ error: "Falta la imagen PNG de la página." }, { status: 400 });
    }
    if (!Number.isFinite(pageNumber) || pageNumber < 1) {
      return NextResponse.json({ error: "pageNumber inválido." }, { status: 400 });
    }
    if (!Number.isFinite(totalPages) || totalPages < 1) {
      return NextResponse.json({ error: "totalPages inválido." }, { status: 400 });
    }

    const buf = Buffer.from(await image.arrayBuffer());
    const extraction = await analyzePdfPagePngWithGemini({
      apiKey,
      pngBuffer: buf,
      pageNumber,
      totalPages,
      fileName,
      feedback,
      maxTokens,
      paraphraseMode,
    });

    return NextResponse.json({ extraction });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al analizar la página.";
    console.error("[extras/pdf-vlm/page]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
