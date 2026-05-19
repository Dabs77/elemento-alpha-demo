import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { listVlmDigestJsonFiles, readVlmDigestJson } from "./collectFundDigestMarkdown";
import type { FundAdvisoryRagResult, RagChunk } from "./fundAdvisoryRagTypes";

export type { FundAdvisoryRagResult, RagChunk };

const DEFAULT_TOP_K = Number(process.env.FUND_ADVISORY_RAG_TOP_K) || 8;
const DEFAULT_MAX_CHARS = Number(process.env.FUND_ADVISORY_RAG_MAX_CHARS) || 32_000;

const STOP_WORDS = new Set([
  "el", "la", "los", "las", "de", "del", "al", "un", "una", "y", "o", "en", "con",
  "por", "para", "que", "como", "cual", "cuál", "cuales", "cuáles", "es", "son",
  "fue", "fueron", "me", "te", "se", "su", "sus", "mi", "mis", "tu", "tus",
  "qué", "dime", "decir", "saber", "sobre", "the", "a", "an",
]);

const QUERY_EXPANSIONS: Record<string, string[]> = {
  cxc: ["cxc", "c por c", "compromiso", "pacto", "30 dias", "30 días"],
  abierto: ["abierto", "vista", "liquidez", "fic abierto"],
  comision: ["comision", "comisión", "comisiones", "administracion", "administración", "honorarios"],
  rentabilidad: ["rentabilidad", "rendimiento", "retorno", "rindio", "rindió", "performance"],
  liquidez: ["liquidez", "retiro", "retiros", "rescate", "vista", "disponibilidad"],
  riesgo: ["riesgo", "volatilidad", "drawdown", "perdida", "pérdida"],
  covid: ["covid", "pandemia", "2020", "estres", "estrés", "crisis"],
  prospecto: ["prospecto", "reglamento", "documento", "legal"],
  comparar: ["comparar", "comparativa", "diferencia", "versus", "vs", "mejor"],
};

const OVERVIEW_PAGES: Record<string, number[]> = {
  "Desempe_o_FIC_Abierto_.pdf-vlm-digest.json": [2, 7],
  "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json": [2, 3],
  "FIC_CxC_Abril_2026.pdf-vlm-digest.json": [1, 2],
  "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json": [1, 2, 3],
  "Reglamento_Fondo_Abierto_2026-3_.pdf-vlm-digest.json": [1, 2],
};

let cachedIndex: RagChunk[] | null = null;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s%áéíóúñ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function expandQueryTokens(queryTokens: string[]): string[] {
  const expanded = new Set(queryTokens);
  for (const token of queryTokens) {
    for (const [, synonyms] of Object.entries(QUERY_EXPANSIONS)) {
      if (synonyms.some((s) => token.includes(s) || s.includes(token))) {
        synonyms.forEach((s) => expanded.add(s.replace(/\s+/g, " ")));
      }
    }
  }
  return [...expanded];
}

function chunkFromPage(
  fileName: string,
  digest: PdfVlmDigestResult,
  pageNumber: number,
): RagChunk | null {
  const page = digest.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) return null;
  const text = page.markdownCompleto?.trim() || page.textoTranscripcion?.trim();
  if (!text) return null;
  return {
    id: `${fileName}#p${pageNumber}`,
    archivo: fileName,
    documento: digest.fileName || fileName,
    pageNumber,
    titulo: page.tituloInferido,
    text,
    source: "local",
  };
}

export function getFundAdvisoryRagIndex(): RagChunk[] {
  if (cachedIndex) return cachedIndex;

  const chunks: RagChunk[] = [];
  for (const name of listVlmDigestJsonFiles()) {
    const digest = readVlmDigestJson(name);
    if (!digest) continue;
    const sortedPages = [...digest.pages].sort((a, b) => a.pageNumber - b.pageNumber);
    for (const page of sortedPages) {
      const chunk = chunkFromPage(name, digest, page.pageNumber);
      if (chunk) chunks.push(chunk);
    }
  }

  cachedIndex = chunks;
  return chunks;
}

function scoreChunk(queryTokens: string[], chunk: RagChunk): number {
  const normalizedQuery = queryTokens.join(" ");
  const haystack = normalizeText(`${chunk.documento} ${chunk.titulo ?? ""} ${chunk.text}`);
  const chunkTokens = new Set(tokenize(haystack));

  let score = 1;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) score += 2;
    if (haystack.includes(token)) score += 1;
  }

  if (/cxc|c por c|compromiso/.test(normalizedQuery)) {
    if (/cxc/i.test(chunk.archivo) || /cxc/i.test(chunk.documento)) score += 5;
  }
  if (/abierto|vista|liquidez/.test(normalizedQuery)) {
    if (/abierto/i.test(chunk.archivo) || /abierto/i.test(chunk.documento)) score += 5;
  }
  if (/comision|administracion|honorario/.test(normalizedQuery) && /comision|administraci/i.test(haystack)) {
    score += 4;
  }
  if (/prospecto|reglamento/.test(normalizedQuery)) {
    if (/prospecto|reglamento/i.test(chunk.archivo)) score += 4;
  }

  return score;
}

export function formatRagChunkForContext(chunk: RagChunk): string {
  const header = `## ${chunk.documento} — pág. ${chunk.pageNumber}${
    chunk.titulo ? `: ${chunk.titulo}` : ""
  }`;
  const sourceLabel =
    chunk.source === "brainbox"
      ? `*Fuente BrainBox: ${chunk.archivo}*`
      : `*Fuente JSON: ${chunk.archivo}*`;
  return `${header}\n${sourceLabel}\n\n${chunk.text}`;
}

function overviewFallbackChunks(): RagChunk[] {
  const out: RagChunk[] = [];
  for (const [fileName, pages] of Object.entries(OVERVIEW_PAGES)) {
    const digest = readVlmDigestJson(fileName);
    if (!digest) continue;
    for (const n of pages) {
      const chunk = chunkFromPage(fileName, digest, n);
      if (chunk) out.push(chunk);
    }
  }
  return out;
}

export function searchFundAdvisoryRagLocal(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): FundAdvisoryRagResult {
  const trimmed = query.trim();
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const maxChars = opts?.maxChars ?? DEFAULT_MAX_CHARS;

  if (!trimmed) {
    return { query: trimmed, chunks: [], context: "", totalChars: 0, provider: "local" };
  }

  const queryTokens = expandQueryTokens(tokenize(trimmed));
  const index = getFundAdvisoryRagIndex();

  const ranked = index
    .map((chunk) => ({ chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected: RagChunk[] = [];
  let totalChars = 0;

  for (const { chunk } of ranked) {
    if (selected.length >= topK) break;
    const formatted = formatRagChunkForContext(chunk);
    if (totalChars + formatted.length > maxChars && selected.length > 0) break;
    selected.push(chunk);
    totalChars += formatted.length;
  }

  if (selected.length === 0) {
    for (const chunk of overviewFallbackChunks()) {
      if (selected.length >= 4) break;
      const formatted = formatRagChunkForContext(chunk);
      if (totalChars + formatted.length > maxChars && selected.length > 0) break;
      selected.push(chunk);
      totalChars += formatted.length;
    }
  }

  const context = selected.map(formatRagChunkForContext).join("\n\n---\n\n");

  return {
    query: trimmed,
    chunks: selected,
    context,
    totalChars: context.length,
    provider: "local",
  };
}
