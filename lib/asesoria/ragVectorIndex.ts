/**
 * Índice vectorial RAG para asesoría de fondos.
 * Indexa todas las páginas de los JSON y permite búsqueda por similitud semántica.
 */

import {
  generateEmbedding,
  generateEmbeddingsBatch,
  findTopKSimilar,
} from "./embeddingsService";
import { listVlmDigestJsonFiles, readVlmDigestJson } from "./collectFundDigestMarkdown";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

export type IndexedChunk = {
  id: string;
  archivo: string;
  documento: string;
  pageNumber: number;
  titulo?: string;
  text: string;
  embedding: number[];
};

type IndexState = {
  chunks: IndexedChunk[];
  ready: boolean;
  building: boolean;
  error?: string;
};

const state: IndexState = {
  chunks: [],
  ready: false,
  building: false,
};

const BATCH_SIZE = 20;
const MAX_TEXT_LENGTH = 8000;

function truncateText(text: string): string {
  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) + "..." : text;
}

function extractChunksFromDigest(
  fileName: string,
  digest: PdfVlmDigestResult,
): Omit<IndexedChunk, "embedding">[] {
  const chunks: Omit<IndexedChunk, "embedding">[] = [];
  const sortedPages = [...digest.pages].sort((a, b) => a.pageNumber - b.pageNumber);

  for (const page of sortedPages) {
    const text = page.markdownCompleto?.trim() || page.textoTranscripcion?.trim();
    if (!text) continue;

    chunks.push({
      id: `${fileName}#p${page.pageNumber}`,
      archivo: fileName,
      documento: digest.fileName || fileName,
      pageNumber: page.pageNumber,
      titulo: page.tituloInferido,
      text,
    });
  }

  return chunks;
}

export async function buildVectorIndex(): Promise<void> {
  if (state.ready || state.building) return;

  state.building = true;
  state.error = undefined;
  console.log("[rag-vector-index] Iniciando indexación de documentos...");

  try {
    const files = listVlmDigestJsonFiles();
    const allChunks: Omit<IndexedChunk, "embedding">[] = [];

    for (const file of files) {
      const digest = readVlmDigestJson(file);
      if (!digest) continue;
      const chunks = extractChunksFromDigest(file, digest);
      allChunks.push(...chunks);
    }

    console.log(`[rag-vector-index] ${allChunks.length} fragmentos extraídos de ${files.length} archivos`);

    const indexedChunks: IndexedChunk[] = [];

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => truncateText(`${c.documento} - ${c.titulo || ""}\n\n${c.text}`));

      console.log(`[rag-vector-index] Generando embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, allChunks.length)}/${allChunks.length}...`);

      const embeddings = await generateEmbeddingsBatch(texts);

      for (let j = 0; j < batch.length; j++) {
        indexedChunks.push({
          ...batch[j],
          embedding: embeddings[j],
        });
      }
    }

    state.chunks = indexedChunks;
    state.ready = true;
    state.building = false;
    console.log(`[rag-vector-index] Índice listo: ${indexedChunks.length} fragmentos indexados`);
  } catch (err) {
    state.building = false;
    state.error = err instanceof Error ? err.message : String(err);
    console.error("[rag-vector-index] Error al construir índice:", state.error);
    throw err;
  }
}

export function isIndexReady(): boolean {
  return state.ready;
}

export function isIndexBuilding(): boolean {
  return state.building;
}

export function getIndexError(): string | undefined {
  return state.error;
}

export function getIndexStats(): { chunks: number; ready: boolean; building: boolean } {
  return {
    chunks: state.chunks.length,
    ready: state.ready,
    building: state.building,
  };
}

export type RagSearchResult = {
  chunk: Omit<IndexedChunk, "embedding">;
  score: number;
};

export async function searchByEmbedding(
  query: string,
  opts?: { topK?: number; minScore?: number },
): Promise<RagSearchResult[]> {
  const topK = opts?.topK ?? 12;
  const minScore = opts?.minScore ?? 0.20;

  if (!state.ready) {
    if (state.building) {
      let waited = 0;
      while (state.building && waited < 30000) {
        await new Promise((r) => setTimeout(r, 500));
        waited += 500;
      }
    }
    if (!state.ready) {
      throw new Error("Índice de embeddings no construido. Usa el botón 'Construir índice' primero.");
    }
  }

  console.log(`[rag-vector-index] Buscando: "${query.slice(0, 80)}..."`);

  const queryEmbedding = await generateEmbedding(query);
  const results = findTopKSimilar(queryEmbedding, state.chunks, topK);

  const filtered = results
    .filter((r) => r.score >= minScore)
    .map((r) => ({
      chunk: {
        id: r.item.id,
        archivo: r.item.archivo,
        documento: r.item.documento,
        pageNumber: r.item.pageNumber,
        titulo: r.item.titulo,
        text: r.item.text,
      },
      score: r.score,
    }));

  console.log(`[rag-vector-index] ${filtered.length} resultados (score >= ${minScore})`);

  return filtered;
}

export function getAllChunks(): Omit<IndexedChunk, "embedding">[] {
  return state.chunks.map((c) => ({
    id: c.id,
    archivo: c.archivo,
    documento: c.documento,
    pageNumber: c.pageNumber,
    titulo: c.titulo,
    text: c.text,
  }));
}
