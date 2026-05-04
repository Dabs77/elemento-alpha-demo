export type RenderedPage = { index: number; buffer: Buffer; mimeType: "image/png" };

function hasPdfJsBrowserGlobals(): boolean {
  const g = globalThis as typeof globalThis & {
    DOMMatrix?: new (...args: unknown[]) => unknown;
  };
  return typeof g.DOMMatrix === "function";
}

/**
 * Render each PDF page to a PNG buffer. Usa `pdf-to-img` (pdfjs + @napi-rs/canvas).
 *
 * En Node/Vercel `DOMMatrix` no existe por defecto: **cargar** `pdf-to-img` revienta con
 * `ReferenceError: DOMMatrix is not defined` antes de ejecutar código nuestro. Si faltan
 * esos globales, devolvemos `[]` y el extractor usa PDF en bruto (`inlineData`) en Gemini.
 */
export async function renderPdfToPngPages(
  buf: Buffer,
  opts: { maxPages?: number; scale?: number } = {}
): Promise<RenderedPage[]> {
  if (!hasPdfJsBrowserGlobals()) {
    return [];
  }
  try {
    const { pdf } = await import("pdf-to-img");
    const maxPages = opts.maxPages ?? 20;
    const scale = opts.scale ?? 2;
    const document = await pdf(buf, { scale });
    const pages: RenderedPage[] = [];
    let i = 0;
    for await (const png of document) {
      pages.push({ index: i + 1, buffer: png, mimeType: "image/png" });
      i += 1;
      if (i >= maxPages) break;
    }
    return pages;
  } catch (err) {
    console.warn("[renderPdf] pdf-to-img no disponible o falló:", err instanceof Error ? err.message : err);
    return [];
  }
}
