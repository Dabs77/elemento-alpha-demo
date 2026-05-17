"use client";

/** Máximo de páginas por ejecución en la herramienta PDF + VLM. */
export const MAX_PDF_VLM_PAGES = 60;

function setPdfWorker(pdfjs: typeof import("pdfjs-dist")) {
  const v = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${v}/build/pdf.worker.min.mjs`;
}

/**
 * Renderiza cada página del PDF a PNG en el navegador (evita limitaciones de Node/DOMMatrix).
 * @param maxPagesToRender — máximo de páginas a rasterizar (el resto no se envía al VLM).
 */
export async function renderPdfFileToPagePngBlobs(
  file: File,
  opts?: { maxPagesToRender?: number; scale?: number }
): Promise<{ pageNumber: number; blob: Blob; totalPagesInFile: number }[]> {
  const maxPagesToRender = Math.min(
    opts?.maxPagesToRender ?? MAX_PDF_VLM_PAGES,
    MAX_PDF_VLM_PAGES
  );
  const scale = opts?.scale ?? 1.75;

  const pdfjs = await import("pdfjs-dist");
  setPdfWorker(pdfjs);

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const totalPagesInFile = pdf.numPages;
  const n = Math.min(totalPagesInFile, maxPagesToRender);

  const out: { pageNumber: number; blob: Blob; totalPagesInFile: number }[] = [];
  try {
    for (let i = 1; i <= n; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No se pudo obtener el contexto 2D del canvas.");
      }
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const task = page.render({ canvasContext: ctx, viewport, canvas });
      await task.promise;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("canvas.toBlob devolvió null."));
        }, "image/png");
      });
      out.push({ pageNumber: i, blob, totalPagesInFile });
    }
  } finally {
    try {
      await pdf.destroy();
    } catch {
      /* noop */
    }
  }
  return out;
}

/** Cuenta páginas sin rasterizar (rápido para mostrar avisos en UI). */
export async function getPdfPageCountInBrowser(file: File): Promise<number> {
  const pdfjs = await import("pdfjs-dist");
  setPdfWorker(pdfjs);
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const n = pdf.numPages;
  try {
    await pdf.destroy();
  } catch {
    /* noop */
  }
  return n;
}
