import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { FIC_ABIERTO_DATA, FIC_CXC_DATA, FUND_COMPARISON_TABLE } from "./fundDataService";
import { STRESS_EPISODES, STRESS_SUMMARY } from "./stressTestData";

/** Límite seguro para Gemini Live (systemInstruction). Fase 2 usa ~5–15 KB. */
const DEFAULT_MAX_CHARS =
  Number(process.env.FUND_ADVISORY_VOICE_MAX_CHARS) || 38_000;

/** Páginas clave por digest (plan de asesoría + docs cortos completos). */
const KEY_PAGES_BY_FILE: Record<string, number[] | "all"> = {
  "Desempe_o_FIC_Abierto_.pdf-vlm-digest.json": [2, 7, 8, 13],
  "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json": [2, 3],
  "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json": [3, 4, 5, 21, 22, 23, 24],
  "FIC_CxC_Abril_2026.pdf-vlm-digest.json": "all",
  "Presentacion-Corporativa-ALIANZA-ASSET-MANAGEMENT_Mar2026..pdf-vlm-digest.json": [
    1, 2, 3, 4, 5, 6,
  ],
  "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json": [1, 2, 3, 4, 5, 6],
  "Reglamento_Fondo_Abierto_2026-3_.pdf-vlm-digest.json": [1, 2, 3, 4, 5, 6],
};

function isSkippedDuplicate(fileName: string): boolean {
  return /\s\(1\)\.json$/i.test(fileName);
}

function isDigestJson(fileName: string): boolean {
  return (
    fileName.toLowerCase().endsWith(".json") &&
    fileName.toLowerCase().includes("pdf-vlm-digest") &&
    !isSkippedDuplicate(fileName)
  );
}

function pageMarkdown(
  digest: PdfVlmDigestResult,
  pageNumber: number,
): string | null {
  const page = digest.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) return null;
  return (
    page.markdownCompleto?.trim() ||
    page.textoTranscripcion?.trim() ||
    null
  );
}

function resolvePageNumbers(
  fileName: string,
  digest: PdfVlmDigestResult,
): number[] {
  const rule = KEY_PAGES_BY_FILE[fileName];
  if (rule === "all") {
    return [...digest.pages]
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.pageNumber);
  }
  if (rule?.length) {
    return rule;
  }
  // Fallback: primeras 5 páginas de documentos no mapeados
  return [...digest.pages]
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .slice(0, 5)
    .map((p) => p.pageNumber);
}

export type FundAdvisoryVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
};

/**
 * Contexto compacto para Gemini Live — mismo patrón que buildRebalanceVoiceContext.
 * Incluye métricas estructuradas + láminas clave de los JSON (no el corpus completo).
 */
export function buildFundAdvisoryVoiceContext(
  maxChars = DEFAULT_MAX_CHARS,
): FundAdvisoryVoiceContextResult {
  const digestExcerpts: {
    archivo: string;
    documento: string;
    paginas: { numero: number; titulo?: string; contenido: string }[];
  }[] = [];

  const dir = path.join(process.cwd(), "info");
  const sourceFiles: string[] = [];

  if (fs.existsSync(dir)) {
    const names = fs.readdirSync(dir).filter(isDigestJson).sort();

    for (const name of names) {
      let parsed: PdfVlmDigestResult;
      try {
        parsed = JSON.parse(
          fs.readFileSync(path.join(dir, name), "utf-8"),
        ) as PdfVlmDigestResult;
      } catch {
        continue;
      }

      const pageNumbers = resolvePageNumbers(name, parsed);
      const paginas: { numero: number; titulo?: string; contenido: string }[] =
        [];

      for (const n of pageNumbers) {
        const content = pageMarkdown(parsed, n);
        if (!content) continue;
        const titulo = parsed.pages.find((p) => p.pageNumber === n)
          ?.tituloInferido;
        paginas.push({
          numero: n,
          titulo,
          contenido: content.slice(0, 4_500),
        });
      }

      if (paginas.length === 0) continue;
      sourceFiles.push(name);
      digestExcerpts.push({
        archivo: name,
        documento: parsed.fileName || name,
        paginas,
      });
    }
  }

  const payload = {
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    nota:
      "Datos demo Marzo 2026. Responde solo con esta información; no inventes cifras.",
    ficAbierto: FIC_ABIERTO_DATA,
    ficCxC: FIC_CXC_DATA,
    comparativa: FUND_COMPARISON_TABLE,
    estresHistorico: {
      resumen: STRESS_SUMMARY,
      episodios: STRESS_EPISODES,
    },
    extractosDocumentos: digestExcerpts,
  };

  let context = JSON.stringify(payload, null, 2);
  let truncated = false;

  if (context.length > maxChars) {
    truncated = true;
    // Quitar páginas de atrás hacia adelante hasta caber
    while (context.length > maxChars && digestExcerpts.length > 0) {
      const last = digestExcerpts[digestExcerpts.length - 1];
      if (last.paginas.length > 1) {
        last.paginas.pop();
      } else {
        digestExcerpts.pop();
      }
      context = JSON.stringify(
        { ...payload, extractosDocumentos: digestExcerpts },
        null,
        2,
      );
    }
    if (context.length > maxChars) {
      context = context.slice(0, maxChars);
      context += '\n\n"... [contexto truncado por límite Gemini Live]"';
    }
  }

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated,
  };
}
