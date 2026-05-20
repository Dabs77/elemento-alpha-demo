import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

/**
 * Contexto de voz COMPLETO: todos los JSON digest de /info2.
 * Incluye FIC Abierto, FIC CxC, reglamentos, prospectos, presentación corporativa y reportes de desempeño.
 */

const INFO_DIR = path.join(process.cwd(), "info2");

/**
 * Páginas optimizadas para caber en ~128k tokens del Live API.
 * Total: ~122 páginas (vs ~230 originales)
 */
const ALL_FILES = [
  {
    archivo: "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json",
    documento: "Plataforma Fondos Alianza · Vista y Cuasi Vista",
    paginas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 35],
  },
  {
    archivo: "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json",
    documento: "Update FIC CxC · marzo 2026",
    paginas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    archivo: "FIC_CxC_Abril_2026_1_.pdf-vlm-digest.json",
    documento: "Ficha técnica FIC CxC · abril 2026",
    paginas: "all" as const,
  },
  {
    archivo: "Prospecto_FIC_CxC_2026-2_.pdf-vlm-digest.json",
    documento: "Prospecto FIC CxC · febrero 2026 (comisiones detalladas)",
    paginas: "all" as const,
  },
  {
    archivo: "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json",
    documento: "Prospecto FIC Abierto · marzo 2026",
    paginas: "all" as const,
  },
  {
    archivo: "Reglamento_Fondo_Abierto_2026-3__1_.pdf-vlm-digest.json",
    documento: "Reglamento Fondo Abierto · marzo 2026 (extracto clave)",
    paginas: [1, 5, 6, 7, 8, 9, 10, 25, 26, 27, 28, 33, 34, 35, 36],
  },
  {
    archivo: "informe_backtest_1_.pdf-vlm-digest.json",
    documento: "Informe Backtest & Stress Test · Abierto vs CxC",
    paginas: "all" as const,
  },
  {
    archivo: "informe_desempe_o_riesgo_1_.pdf-vlm-digest.json",
    documento: "Análisis Desempeño y Riesgo · Abierto vs CxC (31 métricas)",
    paginas: "all" as const,
  },
  {
    archivo: "Desempe_o_FIC_Abierto_.pdf-vlm-digest.json",
    documento: "Reporte Desempeño FIC Abierto (extracto clave)",
    paginas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 25, 26, 27, 28],
  },
  {
    archivo: "Presentacion-Corporativa-ALIANZA-ASSET-MANAGEMENT_Mar2026..pdf-vlm-digest.json",
    documento: "Presentación Corporativa Alianza · marzo 2026 (extracto)",
    paginas: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 27],
  },
];

function readDigest(fileName: string): PdfVlmDigestResult | null {
  const filePath = path.join(INFO_DIR, fileName);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PdfVlmDigestResult;
  } catch {
    return null;
  }
}

function pageMarkdown(digest: PdfVlmDigestResult, pageNumber: number): string | null {
  const page = digest.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) return null;
  return page.markdownCompleto?.trim() || page.textoTranscripcion?.trim() || null;
}

type DigestExcerpt = {
  archivo: string;
  documento: string;
  totalPaginas: number;
  paginas: { numero: number; titulo?: string; contenido: string }[];
};

function buildFullCorpusExcerpts(): DigestExcerpt[] {
  const excerpts: DigestExcerpt[] = [];

  for (const spec of ALL_FILES) {
    const parsed = readDigest(spec.archivo);
    if (!parsed) continue;

    const pageNumbers: number[] =
      spec.paginas === "all"
        ? [...parsed.pages].sort((a, b) => a.pageNumber - b.pageNumber).map((p) => p.pageNumber)
        : spec.paginas;

    const paginas: DigestExcerpt["paginas"] = [];
    for (const n of pageNumbers) {
      const content = pageMarkdown(parsed, n);
      if (!content) continue;
      const titulo = parsed.pages.find((p) => p.pageNumber === n)?.tituloInferido;
      paginas.push({ numero: n, titulo, contenido: content });
    }

    if (paginas.length === 0) continue;
    excerpts.push({
      archivo: spec.archivo,
      documento: spec.documento,
      totalPaginas: parsed.totalPagesInPdf,
      paginas,
    });
  }

  return excerpts;
}

function buildCorpusMarkdown(excerpts: DigestExcerpt[]): string {
  return excerpts
    .map((doc) => {
      const body = doc.paginas
        .map((p) => {
          const header = p.titulo
            ? `#### Página ${p.numero} — ${p.titulo}`
            : `#### Página ${p.numero}`;
          return `${header}\n\n${p.contenido}`;
        })
        .join("\n\n");
      return `### ${doc.documento}\n*Archivo: ${doc.archivo} (${doc.totalPaginas} págs)*\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

export type FundAdvisoryFullCorpusVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  totalPages: number;
  truncated: false;
};

/**
 * Construye el contexto inline con TODOS los JSON digest (corpus completo).
 */
export function buildFundAdvisoryFullCorpusVoiceContext(): FundAdvisoryFullCorpusVoiceContextResult {
  const excerpts = buildFullCorpusExcerpts();
  const sourceFiles = excerpts.map((e) => e.archivo);
  const totalPages = excerpts.reduce((sum, e) => sum + e.paginas.length, 0);
  const corpusMarkdown = buildCorpusMarkdown(excerpts);

  const payload = {
    escenario: "Asesoría especializada · Corpus COMPLETO Alianza Fiduciaria",
    alcance:
      "Este agente tiene acceso al corpus COMPLETO de documentación: " +
      "FIC Abierto, FIC CxC, prospectos, reglamentos, presentación corporativa, " +
      "reportes de desempeño, backtest, y análisis de riesgo. " +
      "Puede responder sobre cualquier aspecto de los fondos y la gestora.",
    fuenteUnica:
      `ÚNICA fuente autorizada: ${sourceFiles.length} archivos JSON digest VLM en /info2. ` +
      "NO uses cifras de memoria del modelo ni datos fuera de estos JSON.",
    archivosIndexados: sourceFiles,
    resumenComparativoAmbosFondos: {
      nota: "Métricas comparativas extraídas del Informe Desempeño y Riesgo (2017–Mar 2026)",
      fondoAbierto: {
        rentabilidadMediaAnual: "5.53%",
        volatilidadAnual: "0.38%",
        sharpe: 14.63,
        maxDrawdown: "-1.10%",
        sortino: 26.71,
      },
      fondoCxC: {
        rentabilidadMediaAnual: "6.92%",
        volatilidadAnual: "0.71%",
        sharpe: 9.74,
        maxDrawdown: "-1.33%",
        sortino: 15.35,
      },
    },
    corpusDocumental: excerpts.map((e) => ({
      archivo: e.archivo,
      documento: e.documento,
      totalPaginas: e.totalPaginas,
      paginasIncluidas: e.paginas.length,
    })),
    corpusDocumentalMarkdown: corpusMarkdown,
  };

  const context = JSON.stringify(payload);

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    totalPages,
    truncated: false,
  };
}
