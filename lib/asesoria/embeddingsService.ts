/**
 * Servicio de embeddings vectoriales para RAG.
 * Usa la API de Google Generative AI (gemini-embedding-001).
 */

import { geminiServerFetch } from "@/lib/geminiServerFetch";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768;

type EmbeddingResponse = {
  embedding: { values: number[] };
};

type BatchEmbeddingResponse = {
  embeddings: { values: number[] }[];
};

let cachedApiKey: string | null = null;

function getApiKey(): string {
  if (cachedApiKey) return cachedApiKey;
  const key = process.env.GEMINI_API_KEY?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY no configurada");
  cachedApiKey = key;
  return key;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  const res = await geminiServerFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as EmbeddingResponse;
  return data.embedding.values;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) return [await generateEmbedding(texts[0])];

  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`;

  const requests = texts.map((text) => ({
    model: `models/${EMBEDDING_MODEL}`,
    content: { parts: [{ text }] },
  }));

  const res = await geminiServerFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Batch Embedding API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as BatchEmbeddingResponse;
  return data.embeddings.map((e) => e.values);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

export function findTopKSimilar<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  items: T[],
  k: number,
): { item: T; score: number }[] {
  const scored = items.map((item) => ({
    item,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export { EMBEDDING_DIMENSION };
