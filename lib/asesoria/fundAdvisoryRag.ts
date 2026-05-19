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
import type { FundAdvisoryRagResult, RagChunk } from "./fundAdvisoryRagTypes";

export type { FundAdvisoryRagResult, RagChunk } from "./fundAdvisoryRagTypes";
export { getFundAdvisoryRagIndex } from "./fundAdvisoryRagLocal";
export { isBrainboxRagEnabled, getBrainboxConfig } from "./brainboxClient";

const DEFAULT_TOP_K = Number(process.env.FUND_ADVISORY_RAG_TOP_K) || 8;
const DEFAULT_MAX_CHARS = Number(process.env.FUND_ADVISORY_RAG_MAX_CHARS) || 32_000;

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

export async function searchFundAdvisoryRagBrainbox(
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

/** Búsqueda RAG: BrainBox si está configurado; si no, índice local JSON. */
export async function searchFundAdvisoryRag(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): Promise<FundAdvisoryRagResult> {
  if (isBrainboxRagEnabled()) {
    try {
      return await searchFundAdvisoryRagBrainbox(query, opts);
    } catch (err) {
      console.error("[fund-advisory-rag] BrainBox falló, usando índice local:", err);
      return searchFundAdvisoryRagLocal(query, opts);
    }
  }
  return searchFundAdvisoryRagLocal(query, opts);
}

const SEED_QUERIES = [
  "rentabilidad FIC Abierto desempeño marzo",
  "FIC CxC rentabilidad update marzo",
  "comisiones prospecto reglamento FIC Abierto",
  "comparativa liquidez plataforma fondos",
];

export async function buildFundAdvisoryRagSeedContext(): Promise<string> {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const q of SEED_QUERIES) {
    const result = await searchFundAdvisoryRag(q, { topK: 3, maxChars: 10_000 });
    for (const chunk of result.chunks) {
      if (seen.has(chunk.id)) continue;
      seen.add(chunk.id);
      parts.push(formatRagChunkForContext(chunk));
    }
  }

  return parts.join("\n\n---\n\n");
}

export async function buildRagSourceMetaPayload(): Promise<Record<string, unknown>> {
  if (isBrainboxRagEnabled()) {
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
      fuenteUnica:
        "ÚNICA fuente autorizada: documentos indexados en BrainBox (búsqueda semántica + reranking). " +
        "Responde SOLO con fragmentos de corpusInicialRag o [FRAGMENTOS RAG]. NO inventes cifras.",
      proveedorRag: "brainbox",
      boxId: cfg?.boxId,
      archivosIndexados: archivos,
    };
  }

  return {
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica:
      "ÚNICA fuente autorizada: archivos JSON digest VLM en /info (prospectos, reglamentos, desempeño, updates). " +
      "NO uses cifras de memoria del modelo ni datos fuera de esos JSON.",
    proveedorRag: "local",
    archivosIndexados: listVlmDigestJsonFiles(),
  };
}

/** @deprecated Usar buildRagSourceMetaPayload */
export function buildJsonSourceMetaPayload() {
  return {
    escenario: "Asesoría especializada · FIC Abierto vs FIC CxC (Alianza)",
    fuenteUnica:
      "ÚNICA fuente autorizada: archivos JSON digest VLM en /info. " +
      "NO uses cifras de memoria del modelo ni datos fuera de esos JSON.",
    archivosIndexados: listVlmDigestJsonFiles(),
  };
}

export function getFundAdvisoryRagProvider(): "brainbox" | "local" {
  return isBrainboxRagEnabled() ? "brainbox" : "local";
}
