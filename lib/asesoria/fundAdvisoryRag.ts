import { listVlmDigestJsonFiles } from "./collectFundDigestMarkdown";
import {
  brainboxListFiles,
  brainboxRetrieveDocuments,
  getBrainboxConfig,
  isBrainboxRagEnabled,
} from "./brainboxClient";
import {
  formatRagChunkForContext,
  searchFundAdvisoryRagLocal,
} from "./fundAdvisoryRagLocal";
import {
  searchByEmbedding,
  buildVectorIndex,
  isIndexReady,
  getIndexStats,
} from "./ragVectorIndex";
import type { FundAdvisoryRagResult, RagChunk, RagProvider } from "./fundAdvisoryRagTypes";

export type { FundAdvisoryRagResult, RagChunk } from "./fundAdvisoryRagTypes";
export { getFundAdvisoryRagIndex } from "./fundAdvisoryRagLocal";
export { isBrainboxRagEnabled, getBrainboxConfig } from "./brainboxClient";
export { buildVectorIndex, isIndexReady, getIndexStats } from "./ragVectorIndex";

const DEFAULT_TOP_K = Number(process.env.FUND_ADVISORY_RAG_TOP_K) || 8;
const DEFAULT_MAX_CHARS = Number(process.env.FUND_ADVISORY_RAG_MAX_CHARS) || 32_000;

type ExtendedProvider = RagProvider | "vector";

function getConfiguredProvider(): ExtendedProvider {
  const p = process.env.FUND_ADVISORY_RAG_PROVIDER?.trim().toLowerCase();
  if (p === "brainbox") return "brainbox";
  if (p === "local" || p === "keywords") return "local";
  if (p === "vector" || p === "embeddings") return "vector";
  // Default: usar embeddings vectoriales
  return "vector";
}

function logRagProvider(
  provider: ExtendedProvider,
  query: string,
  chunkCount: number,
  note?: string,
): void {
  const labels: Record<ExtendedProvider, string> = {
    brainbox: "BrainBox",
    local: "Local (keywords)",
    vector: "Vector (embeddings)",
  };
  const suffix = note ? ` · ${note}` : "";
  console.log(
    `[fund-advisory-rag] ${labels[provider]} — ${chunkCount} fragmento(s) | query: "${query.slice(0, 80)}"${suffix}`,
  );
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return undefined;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string" && val.trim() && !Number.isNaN(Number(val))) {
      return Number(val);
    }
  }
  return undefined;
}

function mapBrainboxDocument(raw: unknown, index: number): RagChunk | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const nested =
    o.metadata && typeof o.metadata === "object"
      ? (o.metadata as Record<string, unknown>)
      : null;

  const text =
    pickString(o, ["content", "text", "passage", "chunk", "markdown", "body"]) ??
    (nested ? pickString(nested, ["content", "text", "passage"]) : undefined);
  if (!text) return null;

  const fileName =
    pickString(o, ["fileName", "file_name", "documentName", "source", "archivo"]) ??
    (nested ? pickString(nested, ["fileName", "file_name", "source"]) : undefined) ??
    "documento";

  const pageNumber =
    pickNumber(o, ["pageNumber", "page_number", "page"]) ??
    (nested ? pickNumber(nested, ["pageNumber", "page_number", "page"]) : undefined) ??
    0;

  const id =
    pickString(o, ["id", "chunkId", "chunk_id"]) ??
    `${fileName}#p${pageNumber || index + 1}`;

  return {
    id,
    archivo: fileName,
    documento: fileName,
    pageNumber,
    titulo: pickString(o, ["title", "titulo", "heading"]),
    text,
    source: "brainbox",
    score: pickNumber(o, ["score", "relevance", "relevanceScore"]),
  };
}

function selectChunksWithinLimit(chunks: RagChunk[], maxChars: number, topK: number): RagChunk[] {
  const selected: RagChunk[] = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    if (selected.length >= topK) break;
    const formatted = formatRagChunkForContext(chunk);
    if (totalChars + formatted.length > maxChars && selected.length > 0) break;
    selected.push(chunk);
    totalChars += formatted.length;
  }

  return selected;
}

async function searchFundAdvisoryRagBrainbox(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): Promise<FundAdvisoryRagResult> {
  const trimmed = query.trim();
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const maxChars = opts?.maxChars ?? DEFAULT_MAX_CHARS;

  if (!trimmed) {
    return { query: trimmed, chunks: [], context: "", totalChars: 0, provider: "brainbox" };
  }

  const result = await brainboxRetrieveDocuments(trimmed);
  const mapped = result.documents
    .map((doc, i) => mapBrainboxDocument(doc, i))
    .filter((c): c is RagChunk => c !== null);

  const sorted = [...mapped].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const selected = selectChunksWithinLimit(sorted, maxChars, topK);
  const context = selected.map(formatRagChunkForContext).join("\n\n---\n\n");

  const units =
    result.usage?.intelligence_units_consumed ?? result.usage?.intelligenceUnitsConsumed;

  return {
    query: trimmed,
    chunks: selected,
    context,
    totalChars: context.length,
    provider: "brainbox",
    usage: units !== undefined ? { intelligenceUnitsConsumed: units } : undefined,
  };
}

async function searchFundAdvisoryRagVector(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): Promise<FundAdvisoryRagResult> {
  const trimmed = query.trim();
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const maxChars = opts?.maxChars ?? DEFAULT_MAX_CHARS;

  if (!trimmed) {
    return { query: trimmed, chunks: [], context: "", totalChars: 0, provider: "local" };
  }

  const results = await searchByEmbedding(trimmed, { topK: topK * 2, minScore: 0.25 });

  const chunks: RagChunk[] = results.map((r) => ({
    id: r.chunk.id,
    archivo: r.chunk.archivo,
    documento: r.chunk.documento,
    pageNumber: r.chunk.pageNumber,
    titulo: r.chunk.titulo,
    text: r.chunk.text,
    source: "local",
    score: r.score,
  }));

  const selected = selectChunksWithinLimit(chunks, maxChars, topK);
  const context = selected.map(formatRagChunkForContext).join("\n\n---\n\n");

  return {
    query: trimmed,
    chunks: selected,
    context,
    totalChars: context.length,
    provider: "local",
  };
}

/** Búsqueda RAG: vector (embeddings), BrainBox, o keywords según configuración. */
export async function searchFundAdvisoryRag(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): Promise<FundAdvisoryRagResult> {
  const provider = getConfiguredProvider();

  if (provider === "brainbox" && isBrainboxRagEnabled()) {
    try {
      const result = await searchFundAdvisoryRagBrainbox(query, opts);
      const units = result.usage?.intelligenceUnitsConsumed;
      logRagProvider("brainbox", query, result.chunks.length, units ? `${units} units` : undefined);
      return result;
    } catch (err) {
      console.warn("[fund-advisory-rag] BrainBox falló → fallback vector:", err instanceof Error ? err.message : err);
    }
  }

  if (provider === "vector" || provider === "brainbox") {
    try {
      const result = await searchFundAdvisoryRagVector(query, opts);
      const topScore = result.chunks[0]?.score;
      logRagProvider("vector", query, result.chunks.length, topScore ? `top score: ${topScore.toFixed(3)}` : undefined);
      return result;
    } catch (err) {
      console.warn("[fund-advisory-rag] Vector falló → fallback keywords:", err instanceof Error ? err.message : err);
    }
  }

  const local = searchFundAdvisoryRagLocal(query, opts);
  logRagProvider("local", query, local.chunks.length, "keywords");
  return local;
}

const SEED_QUERIES = [
  "rentabilidad FIC Abierto desempeño marzo 2026",
  "FIC CxC rentabilidad comisiones pacto permanencia",
  "prospecto reglamento comisiones tipos participación",
  "comparativa liquidez volatilidad riesgo fondos",
];

export async function buildFundAdvisoryRagSeedContext(): Promise<string> {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const q of SEED_QUERIES) {
    const result = await searchFundAdvisoryRag(q, { topK: 4, maxChars: 15_000 });
    for (const chunk of result.chunks) {
      if (seen.has(chunk.id)) continue;
      seen.add(chunk.id);
      parts.push(formatRagChunkForContext(chunk));
    }
  }

  return parts.join("\n\n---\n\n");
}

export async function buildRagSourceMetaPayload(): Promise<Record<string, unknown>> {
  const provider = getConfiguredProvider();

  if (provider === "brainbox" && isBrainboxRagEnabled()) {
    const cfg = getBrainboxConfig();
    let archivos: string[] = cfg?.fileIds ?? [];

    if (!archivos.length && cfg) {
      try {
        const files = await brainboxListFiles(cfg);
        archivos = files.map((f) => f.fileName ?? f.id);
      } catch {
        archivos = [];
      }
    }

    return {
      escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
      fuenteUnica: "Documentos indexados en BrainBox (búsqueda semántica + reranking).",
      proveedorRag: "brainbox",
      boxId: cfg?.boxId,
      archivosIndexados: archivos,
    };
  }

  const stats = getIndexStats();
  return {
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica:
      provider === "vector"
        ? "Búsqueda semántica con embeddings vectoriales sobre JSON digest en /info."
        : "Búsqueda por keywords sobre JSON digest en /info.",
    proveedorRag: provider === "vector" ? "vector" : "local",
    archivosIndexados: listVlmDigestJsonFiles(),
    fragmentosIndexados: stats.chunks,
    indiceVectorialListo: stats.ready,
  };
}

/** @deprecated Usar buildRagSourceMetaPayload */
export function buildJsonSourceMetaPayload() {
  return {
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica: "Archivos JSON digest VLM en /info.",
    archivosIndexados: listVlmDigestJsonFiles(),
  };
}

export function getFundAdvisoryRagProvider(): RagProvider {
  const p = getConfiguredProvider();
  return p === "vector" ? "local" : p;
}
