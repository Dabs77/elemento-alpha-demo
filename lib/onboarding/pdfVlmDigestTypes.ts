export type PdfVisualElementExtraction = {
  tipo: string;
  /** Descripción exhaustiva del contenido informativo (qué comunica). */
  descripcionInformacion: string;
  /** Leyendas, ejes, unidades, series, etiquetas relevantes. */
  metadataVisual?: string;
  /** Valores numéricos o aproximaciones legibles en la imagen. */
  datosObservados?: string;
};

/** Extracción VLM de una sola página (PDF renderizada como PNG). */
export type PdfPageVlmExtraction = {
  pageNumber: number;
  tituloInferido?: string;
  textoTranscripcion?: string;
  elementosVisuales?: PdfVisualElementExtraction[];
  tablasMarkdown?: string;
  /** Resumen único en Markdown (texto + referencias a visuales ya descritos). */
  markdownCompleto: string;
};

export type PdfVlmDigestResult = {
  fileName: string;
  totalPagesInPdf: number;
  pagesAnalyzed: number;
  extractedAt: string;
  pages: PdfPageVlmExtraction[];
  /** Concatenación ordenada de `markdownCompleto` por página. */
  fullMarkdown: string;
};
