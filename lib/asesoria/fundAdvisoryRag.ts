import {
  brainboxListFiles,
  brainboxRetrieveDocuments,
  getBrainboxConfig,
  isBrainboxRagEnabled,
  BrainboxApiError,
  type BrainboxRetrievedChunk,
} from "./brainboxClient";
import { formatRagChunkForContext } from "./fundAdvisoryRagLocal";
import {
  getRagProvider,
  setRagProvider,
  getProviderInfo,
  type RagProviderType,
  PROVIDER_LABELS,
  PROVIDER_DESCRIPTIONS,
} from "./ragProviderState";
import type { FundAdvisoryRagResult, RagChunk, RagProvider } from "./fundAdvisoryRagTypes";

export type { FundAdvisoryRagResult, RagChunk } from "./fundAdvisoryRagTypes";
export { isBrainboxRagEnabled, getBrainboxConfig, BrainboxApiError } from "./brainboxClient";
export {
  getRagProvider,
  setRagProvider,
  getProviderInfo,
  type RagProviderType,
  PROVIDER_LABELS,
  PROVIDER_DESCRIPTIONS,
} from "./ragProviderState";

const DEFAULT_TOP_K = Number(process.env.FUND_ADVISORY_RAG_TOP_K) || 12;
const DEFAULT_MAX_CHARS = Number(process.env.FUND_ADVISORY_RAG_MAX_CHARS) || 60_000;

function logRagProvider(_query: string, _chunks: RagChunk[], _note?: string): void {
  // Logging desactivado: solo se muestra la query en brainboxClient.
}

function mapBrainboxChunkToRagChunk(chunk: BrainboxRetrievedChunk, index: number): RagChunk {
  return {
    id: chunk.fileId ? `${chunk.fileId}#p${chunk.page || index + 1}` : `chunk-${index}`,
    archivo: chunk.fileName,
    documento: chunk.fileName,
    pageNumber: chunk.page,
    text: chunk.text,
    source: "brainbox",
    score: chunk.score,
    link: chunk.link,
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

/** Búsqueda RAG con BrainBox. */
export async function searchFundAdvisoryRag(
  query: string,
  opts?: { topK?: number; maxChars?: number; threshold?: number },
): Promise<FundAdvisoryRagResult> {
  const trimmed = query.trim();
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  const maxChars = opts?.maxChars ?? DEFAULT_MAX_CHARS;

  if (!trimmed) {
    return { query: trimmed, chunks: [], context: "", totalChars: 0, provider: "brainbox" };
  }

  if (!isBrainboxRagEnabled()) {
    throw new BrainboxApiError("BrainBox no está configurado. Configura BRAINBOX_API_KEY y BRAINBOX_BOX_ID.", { code: "NOT_CONFIGURED", status: 500 });
  }

  const result = await brainboxRetrieveDocuments(trimmed, { threshold: opts?.threshold });
  const mapped = result.documents.map((chunk, i) => mapBrainboxChunkToRagChunk(chunk, i));

  const sorted = [...mapped].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const selected = selectChunksWithinLimit(sorted, maxChars, topK);
  const context = selected.map(formatRagChunkForContext).join("\n\n---\n\n");

  const units = result.usage?.intelligence_units_consumed;
  logRagProvider(trimmed, selected, units ? `${units} units` : undefined);

  return {
    query: trimmed,
    chunks: selected,
    context,
    totalChars: context.length,
    provider: "brainbox",
    usage: units !== undefined ? { intelligenceUnitsConsumed: units } : undefined,
  };
}

export async function buildFundAdvisoryRagSeedContext(): Promise<string> {
  return "[BrainBox activo: las consultas se hacen en tiempo real por cada pregunta del usuario]";
}

export async function buildRagSourceMetaPayload(): Promise<Record<string, unknown>> {
  const cfg = getBrainboxConfig();
  let archivos: string[] = cfg?.fileIds ?? [];

  if (!archivos.length && cfg) {
    try {
      const files = await brainboxListFiles(cfg);
      archivos = files.map((f) => f.name || f.fileId);
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

export function getFundAdvisoryRagProvider(): RagProvider {
  return "brainbox";
}

/** Información completa del proveedor para API. */
export function getFundAdvisoryRagProviderInfo() {
  const info = getProviderInfo();
  const brainboxCfg = getBrainboxConfig();
  return {
    ...info,
    labels: PROVIDER_LABELS,
    descriptions: PROVIDER_DESCRIPTIONS,
    brainboxConfigured: brainboxCfg !== null,
    brainboxBoxId: brainboxCfg?.boxId,
  };
}
