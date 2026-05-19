import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { FIC_ABIERTO_DATA, FIC_CXC_DATA, FUND_COMPARISON_TABLE } from "./fundDataService";
import { STRESS_EPISODES, STRESS_SUMMARY } from "./stressTestData";
import { listVlmDigestJsonFiles, readVlmDigestJson } from "./collectFundDigestMarkdown";

/** Modo compacto (~40 KB) evita agotar cuota de Gemini Live. Full JSON ~1,8M chars. */
export function isFundAdvisoryVoiceFullJsonMode(): boolean {
  const v = process.env.FUND_ADVISORY_VOICE_FULL_JSON?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

const COMPACT_MAX_CHARS =
  Number(process.env.FUND_ADVISORY_VOICE_MAX_CHARS) || 38_000;

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

export type FundAdvisoryVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
  mode: "full" | "compact";
};

function pageMarkdown(digest: PdfVlmDigestResult, pageNumber: number): string | null {
  const page = digest.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) return null;
  return page.markdownCompleto?.trim() || page.textoTranscripcion?.trim() || null;
}

function resolvePageNumbers(fileName: string, digest: PdfVlmDigestResult): number[] {
  const rule = KEY_PAGES_BY_FILE[fileName];
  if (rule === "all") {
    return [...digest.pages]
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.pageNumber);
  }
  if (rule?.length) return rule;
  return [...digest.pages]
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .slice(0, 5)
    .map((p) => p.pageNumber);
}

function buildStructuredPayload(documentosVlmDigest: unknown) {
  return {
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
    documentosVlmDigest,
  };
}

function buildFullJsonContext(): FundAdvisoryVoiceContextResult {
  const documentosVlmDigest: {
    archivoJson: string;
    digest: NonNullable<ReturnType<typeof readVlmDigestJson>>;
  }[] = [];
  const sourceFiles: string[] = [];

  for (const name of listVlmDigestJsonFiles()) {
    const parsed = readVlmDigestJson(name);
    if (!parsed) continue;
    sourceFiles.push(name);
    documentosVlmDigest.push({ archivoJson: name, digest: parsed });
  }

  const context = JSON.stringify(buildStructuredPayload(documentosVlmDigest));

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated: false,
    mode: "full",
  };
}

function buildCompactContext(): FundAdvisoryVoiceContextResult {
  const digestExcerpts: {
    archivo: string;
    documento: string;
    paginas: { numero: number; titulo?: string; contenido: string }[];
  }[] = [];
  const sourceFiles: string[] = [];

  for (const name of listVlmDigestJsonFiles()) {
    const parsed = readVlmDigestJson(name);
    if (!parsed) continue;

    const pageNumbers = resolvePageNumbers(name, parsed);
    const paginas: { numero: number; titulo?: string; contenido: string }[] = [];

    for (const n of pageNumbers) {
      const content = pageMarkdown(parsed, n);
      if (!content) continue;
      const titulo = parsed.pages.find((p) => p.pageNumber === n)?.tituloInferido;
      paginas.push({ numero: n, titulo, contenido: content.slice(0, 4_500) });
    }

    if (paginas.length === 0) continue;
    sourceFiles.push(name);
    digestExcerpts.push({
      archivo: name,
      documento: parsed.fileName || name,
      paginas,
    });
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

  let context = JSON.stringify(payload);
  let truncated = false;

  if (context.length > COMPACT_MAX_CHARS) {
    truncated = true;
    while (context.length > COMPACT_MAX_CHARS && digestExcerpts.length > 0) {
      const last = digestExcerpts[digestExcerpts.length - 1];
      if (last.paginas.length > 1) {
        last.paginas.pop();
      } else {
        digestExcerpts.pop();
      }
      context = JSON.stringify({ ...payload, extractosDocumentos: digestExcerpts });
    }
    if (context.length > COMPACT_MAX_CHARS) {
      context = context.slice(0, COMPACT_MAX_CHARS);
      context += '..."[contexto truncado por límite Gemini Live]"';
    }
  }

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated,
    mode: "compact",
  };
}

/**
 * Contexto para asesoría por voz.
 * Por defecto: compacto (~40 KB, cabe en cuota free de Live).
 * Full JSON: FUND_ADVISORY_VOICE_FULL_JSON=1 en .env.local (~1,8M chars, requiere plan con cuota).
 */
export function buildFundAdvisoryVoiceContext(): FundAdvisoryVoiceContextResult {
  return isFundAdvisoryVoiceFullJsonMode()
    ? buildFullJsonContext()
    : buildCompactContext();
}
