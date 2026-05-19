import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

/** Archivos duplicados subidos (mismo digest dos veces) */
export function isSkippedDuplicateDigestFile(fileName: string): boolean {
  return /\s\(1\)\.json$/i.test(fileName);
}

export function isVlmDigestJson(fileName: string): boolean {
  return (
    fileName.toLowerCase().endsWith(".json") &&
    fileName.toLowerCase().includes("pdf-vlm-digest") &&
    !isSkippedDuplicateDigestFile(fileName)
  );
}

const INFO_DIR = path.join(process.cwd(), "info");

/** Lista ordenada de archivos digest VLM en /info (sin duplicados). */
export function listVlmDigestJsonFiles(): string[] {
  if (!fs.existsSync(INFO_DIR)) return [];
  return fs
    .readdirSync(INFO_DIR)
    .filter((n) => isVlmDigestJson(n))
    .sort((a, b) => a.localeCompare(b));
}

export function readVlmDigestJson(fileName: string): PdfVlmDigestResult | null {
  const filePath = path.join(INFO_DIR, fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PdfVlmDigestResult;
  } catch {
    return null;
  }
}

function markdownFromDigest(digest: PdfVlmDigestResult): string {
  const full = digest.fullMarkdown?.trim();
  if (full) return full;
  const pages = [...(digest.pages ?? [])].sort((a, b) => a.pageNumber - b.pageNumber);
  return pages
    .map((p) => p.markdownCompleto?.trim() || p.textoTranscripcion?.trim() || "")
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export type CollectedDigestResult = {
  markdown: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
};

export type CollectedFullJsonResult = {
  /** JSON serializado con todos los digests íntegros + metadatos */
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
};

/**
 * Lee todos los *.pdf-vlm-digest*.json en /info y concatena su contenido textual.
 * Pensado solo para rutas de servidor (no importar desde componentes cliente).
 */
export function collectAllFundDigestsMarkdown(
  maxChars = Number(process.env.FUND_ADVISORY_DIGEST_MAX_CHARS) || 1_600_000,
): CollectedDigestResult {
  const names = listVlmDigestJsonFiles();
  if (names.length === 0) {
    return { markdown: "", sourceFiles: [], totalChars: 0, truncated: false };
  }

  const parts: string[] = [];
  const sourceFiles: string[] = [];
  let truncated = false;

  for (const name of names) {
    const parsed = readVlmDigestJson(name);
    if (!parsed) continue;
    const docLabel = parsed.fileName || name.replace(/\.json$/i, "");
    const body = markdownFromDigest(parsed);
    if (!body) continue;
    sourceFiles.push(name);
    const section = `\n\n---\n\n## Corpus documental (digest VLM): ${docLabel}\n\n*Archivo JSON: ${name} · ${parsed.pagesAnalyzed ?? "?"} páginas analizadas*\n\n${body}`;
    parts.push(section);
    const merged = parts.join("");
    if (merged.length >= maxChars) {
      truncated = true;
      const slice = merged.slice(0, maxChars);
      return {
        markdown: `${slice}\n\n---\n\n*[Corpus truncado por límite configurado (${maxChars.toLocaleString()} caracteres).]*`,
        sourceFiles,
        totalChars: maxChars,
        truncated: true,
      };
    }
  }

  const markdown = parts.join("").trim();
  return {
    markdown,
    sourceFiles,
    totalChars: markdown.length,
    truncated,
  };
}

/**
 * Lee todos los digest VLM y devuelve el JSON íntegro de cada archivo
 * (sin filtrar páginas ni recortar campos).
 */
export function collectAllFundDigestsFullJson(): CollectedFullJsonResult {
  const names = listVlmDigestJsonFiles();
  const documentosVlmDigest: {
    archivoJson: string;
    digest: PdfVlmDigestResult;
  }[] = [];
  const sourceFiles: string[] = [];

  for (const name of names) {
    const parsed = readVlmDigestJson(name);
    if (!parsed) continue;
    sourceFiles.push(name);
    documentosVlmDigest.push({ archivoJson: name, digest: parsed });
  }

  const payload = {
    nota: "Corpus íntegro de digests VLM (JSON completo por archivo). Responde solo con esta información.",
    documentosVlmDigest,
  };

  const context = JSON.stringify(payload, null, 2);
  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated: false,
  };
}
