import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { listVlmDigestJsonFiles, readVlmDigestJson } from "./collectFundDigestMarkdown";
import {
  buildFundAdvisoryRagSeedContext,
  buildRagSourceMetaPayload,
  getFundAdvisoryRagProvider,
} from "./fundAdvisoryRag";

/** RAG activo por defecto; desactivar con FUND_ADVISORY_VOICE_RAG=0 */
export function isFundAdvisoryVoiceRagMode(): boolean {
  const v = process.env.FUND_ADVISORY_VOICE_RAG?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return !isFundAdvisoryVoiceFullJsonMode();
}

/** Modo compacto ampliado (~120 KB). Full JSON ~1,8M chars (requiere cuota). */
export function isFundAdvisoryVoiceFullJsonMode(): boolean {
  const v = process.env.FUND_ADVISORY_VOICE_FULL_JSON?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

const COMPACT_MAX_CHARS =
  Number(process.env.FUND_ADVISORY_VOICE_MAX_CHARS) || 120_000;

const KEY_PAGES_BY_FILE: Record<string, number[] | "all"> = {
  "Desempe_o_FIC_Abierto_.pdf-vlm-digest.json": [2, 7, 8, 13],
  "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json": [2, 3],
  "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json": [3, 4, 5, 21, 22, 23, 24],
  "FIC_CxC_Abril_2026.pdf-vlm-digest.json": "all",
  "Presentacion-Corporativa-ALIANZA-ASSET-MANAGEMENT_Mar2026..pdf-vlm-digest.json": [
    1, 2, 3, 4, 5, 6,
  ],
  "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "Reglamento_Fondo_Abierto_2026-3_.pdf-vlm-digest.json": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const FILE_TRUNCATION_PRIORITY: Record<string, number> = {
  "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json": 1,
  "Reglamento_Fondo_Abierto_2026-3_.pdf-vlm-digest.json": 2,
  "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json": 3,
  "FIC_CxC_Abril_2026.pdf-vlm-digest.json": 4,
  "Desempe_o_FIC_Abierto_.pdf-vlm-digest.json": 5,
  "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json": 6,
  "Presentacion-Corporativa-ALIANZA-ASSET-MANAGEMENT_Mar2026..pdf-vlm-digest.json": 7,
};

export type FundAdvisoryVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
  mode: "full" | "compact" | "rag";
  ragProvider?: "brainbox" | "local";
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
    .slice(0, 6)
    .map((p) => p.pageNumber);
}

type DigestExcerpt = {
  archivo: string;
  documento: string;
  paginas: { numero: number; titulo?: string; contenido: string }[];
};

function buildDigestExcerpts(): DigestExcerpt[] {
  const excerpts: DigestExcerpt[] = [];

  for (const name of listVlmDigestJsonFiles()) {
    const parsed = readVlmDigestJson(name);
    if (!parsed) continue;

    const pageNumbers = resolvePageNumbers(name, parsed);
    const paginas: DigestExcerpt["paginas"] = [];

    for (const n of pageNumbers) {
      const content = pageMarkdown(parsed, n);
      if (!content) continue;
      const titulo = parsed.pages.find((p) => p.pageNumber === n)?.tituloInferido;
      paginas.push({ numero: n, titulo, contenido: content });
    }

    if (paginas.length === 0) continue;
    excerpts.push({
      archivo: name,
      documento: parsed.fileName || name,
      paginas,
    });
  }

  return excerpts;
}

function buildCorpusMarkdown(excerpts: DigestExcerpt[]): string {
  return excerpts
    .map((doc) => {
      const body = doc.paginas
        .map((p) => {
          const header = p.titulo
            ? `#### Página ${p.numero} — ${p.titulo}`
            : `#### Página ${p.numero}`;
          return `${header}\n\n${p.contenido}`;
        })
        .join("\n\n");
      return `### ${doc.documento}\n*Archivo JSON: ${doc.archivo}*\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

function serializeJsonOnlyPayload(corpusMarkdown: string, excerpts: DigestExcerpt[]): string {
  return JSON.stringify({
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica:
      "ÚNICA fuente autorizada: archivos JSON digest VLM en /info. " +
      "NO uses cifras de memoria del modelo ni datos fuera de esos JSON.",
    archivosIndexados: excerpts.map((e) => e.archivo),
    corpusDocumental: excerpts.map((e) => ({
      archivo: e.archivo,
      documento: e.documento,
      paginasIncluidas: e.paginas.map((p) => p.numero),
    })),
    corpusDocumentalMarkdown: corpusMarkdown,
  });
}

function truncateExcerptsToFit(excerpts: DigestExcerpt[], maxChars: number): {
  excerpts: DigestExcerpt[];
  truncated: boolean;
} {
  let working = excerpts.map((e) => ({ ...e, paginas: [...e.paginas] }));
  let truncated = false;

  const fits = () =>
    serializeJsonOnlyPayload(buildCorpusMarkdown(working), working).length <= maxChars;

  if (fits()) return { excerpts: working, truncated: false };

  truncated = true;
  const byPriority = [...working].sort(
    (a, b) =>
      (FILE_TRUNCATION_PRIORITY[b.archivo] ?? 99) -
      (FILE_TRUNCATION_PRIORITY[a.archivo] ?? 99),
  );

  while (!fits() && byPriority.length > 0) {
    const target = byPriority[0];
    const doc = working.find((d) => d.archivo === target.archivo);
    if (!doc || doc.paginas.length === 0) {
      byPriority.shift();
      working = working.filter((d) => d.archivo !== target.archivo);
      continue;
    }
    doc.paginas.pop();
    if (doc.paginas.length === 0) {
      byPriority.shift();
      working = working.filter((d) => d.archivo !== target.archivo);
    }
  }

  return { excerpts: working, truncated };
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

  const context = JSON.stringify({
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica:
      "ÚNICA fuente autorizada: archivos JSON digest VLM en /info. " +
      "NO uses cifras de memoria del modelo ni datos fuera de esos JSON.",
    archivosIndexados: sourceFiles,
    documentosVlmDigest,
  });

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated: false,
    mode: "full",
  };
}

function buildCompactContext(): FundAdvisoryVoiceContextResult {
  const allExcerpts = buildDigestExcerpts();
  const sourceFiles = allExcerpts.map((e) => e.archivo);
  const { excerpts, truncated } = truncateExcerptsToFit(allExcerpts, COMPACT_MAX_CHARS);
  const corpusMarkdown = buildCorpusMarkdown(excerpts);
  const context = serializeJsonOnlyPayload(corpusMarkdown, excerpts);

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated,
    mode: "compact",
  };
}

async function buildRagBaseContext(): Promise<FundAdvisoryVoiceContextResult> {
  const [seedCorpus, meta] = await Promise.all([
    buildFundAdvisoryRagSeedContext(),
    buildRagSourceMetaPayload(),
  ]);
  const provider = getFundAdvisoryRagProvider();
  const notaRag =
    provider === "brainbox"
      ? "Corpus indexado en BrainBox (búsqueda semántica). Recibirás [FRAGMENTOS RAG] por pregunta. " +
        "Responde SOLO con esos extractos; si no está, di que no tienes el dato."
      : "Corpus indexado desde JSON digest VLM. Recibirás [FRAGMENTOS RAG] por pregunta. " +
        "Responde SOLO con texto de esos JSON; si no está, di que no tienes el dato.";

  const context = JSON.stringify({
    ...meta,
    modo: "rag",
    notaRag,
    corpusInicialRag: seedCorpus,
  });

  const sourceFiles = Array.isArray(meta.archivosIndexados)
    ? (meta.archivosIndexados as string[])
    : listVlmDigestJsonFiles();

  console.log(
    `[fund-advisory-voice-context] RAG: ${provider === "brainbox" ? "BrainBox" : "Local (JSON /info)"}`,
  );

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated: false,
    mode: "rag",
    ragProvider: provider,
  };
}

/**
 * Contexto para asesoría por voz.
 * RAG por defecto (BrainBox si está configurado; si no, JSON local en /info).
 */
export async function buildFundAdvisoryVoiceContext(): Promise<FundAdvisoryVoiceContextResult> {
  if (isFundAdvisoryVoiceFullJsonMode()) return buildFullJsonContext();
  if (isFundAdvisoryVoiceRagMode()) return buildRagBaseContext();
  return buildCompactContext();
}
