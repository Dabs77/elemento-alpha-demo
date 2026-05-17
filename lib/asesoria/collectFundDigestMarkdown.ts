import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

/** Archivos duplicados subidos (mismo digest dos veces) */
function isSkippedDuplicateDigestFile(fileName: string): boolean {
  return /\s\(1\)\.json$/i.test(fileName);
}

function isVlmDigestJson(fileName: string): boolean {
  return (
    fileName.toLowerCase().endsWith(".json") &&
    fileName.toLowerCase().includes("pdf-vlm-digest") &&
    !isSkippedDuplicateDigestFile(fileName)
  );
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

/**
 * Lee todos los *.pdf-vlm-digest*.json en /info y concatena su contenido textual.
 * Pensado solo para rutas de servidor (no importar desde componentes cliente).
 */
export function collectAllFundDigestsMarkdown(
  maxChars = Number(process.env.FUND_ADVISORY_DIGEST_MAX_CHARS) || 1_600_000
): CollectedDigestResult {
  const dir = path.join(process.cwd(), "info");
  if (!fs.existsSync(dir)) {
    return { markdown: "", sourceFiles: [], totalChars: 0, truncated: false };
  }

  const names = fs
    .readdirSync(dir)
    .filter((n) => isVlmDigestJson(n))
    .sort((a, b) => a.localeCompare(b));

  const parts: string[] = [];
  const sourceFiles: string[] = [];
  let truncated = false;

  for (const name of names) {
    const filePath = path.join(dir, name);
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }
    let parsed: PdfVlmDigestResult;
    try {
      parsed = JSON.parse(raw) as PdfVlmDigestResult;
    } catch {
      continue;
    }
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
