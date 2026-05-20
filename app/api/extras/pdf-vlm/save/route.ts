import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const digest = body.digest as PdfVlmDigestResult | undefined;

    if (!digest || !digest.fileName || !Array.isArray(digest.pages)) {
      return NextResponse.json(
        { error: "JSON de digest inválido." },
        { status: 400 }
      );
    }

    const info2Dir = path.join(process.cwd(), "info2");
    if (!fs.existsSync(info2Dir)) {
      fs.mkdirSync(info2Dir, { recursive: true });
    }

    const safeName = digest.fileName
      .replace(/[^\w.-]+/g, "_")
      .replace(/\.pdf$/i, "")
      .slice(0, 80);
    const outputFileName = `${safeName || "documento"}.pdf-vlm-digest.json`;
    const outputPath = path.join(info2Dir, outputFileName);

    fs.writeFileSync(outputPath, JSON.stringify(digest, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      savedAs: outputFileName,
      path: `info2/${outputFileName}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar el archivo.";
    console.error("[extras/pdf-vlm/save]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
