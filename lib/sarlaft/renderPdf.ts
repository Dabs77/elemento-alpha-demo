export type RenderedPage = { index: number; buffer: Buffer; mimeType: "image/png" };

/**
 * Render each PDF page to a PNG buffer. Usa `pdf-to-img` (pdfjs + @napi-rs/canvas).
 *
 * Importación dinámica: en Vercel el binario `@napi-rs/canvas` puede fallar al cargar el
 * módulo; si cargamos esto solo al rasterizar y devolvemos `[]`, el extractor hace fallback
 * a PDF en bruto (inlineData).
 */
export async function renderPdfToPngPages(
  buf: Buffer,
  opts: { maxPages?: number; scale?: number } = {}
): Promise<RenderedPage[]> {
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
