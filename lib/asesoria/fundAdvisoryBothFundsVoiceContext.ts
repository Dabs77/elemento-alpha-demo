import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

/**
 * Contexto de voz para AMBOS fondos: FIC Abierto y FIC CxC.
 * Incluye comparativas, prospectos y análisis de desempeño de ambos.
 * NO depende de BrainBox ni RAG remoto: todo es inline.
 */

const INFO_DIR = path.join(process.cwd(), "info2");

const PLATAFORMA_FILE = "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json";
const UPDATE_CXC_FILE = "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json";
const FICHA_TECNICA_CXC_FILE = "FIC_CxC_Abril_2026_1_.pdf-vlm-digest.json";
const INFORME_BACKTEST_FILE = "informe_backtest_1_.pdf-vlm-digest.json";
const INFORME_DESEMPENO_RIESGO_FILE = "informe_desempe_o_riesgo_1_.pdf-vlm-digest.json";
const PROSPECTO_ABIERTO_FILE = "Prospecto_FIC_Abierto_2026-03_.pdf-vlm-digest.json";

/**
 * Páginas de la Plataforma para ambos fondos (incluye todas las columnas).
 * Solo excluimos headers vacíos y anexos muy extensos.
 */
const PLATAFORMA_BOTH_PAGES: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 35,
];

type DocSpec = {
  archivo: string;
  documento: string;
  paginas: number[] | "all";
};

const BOTH_FUNDS_DOC_SPECS: DocSpec[] = [
  {
    archivo: PLATAFORMA_FILE,
    documento: "Plataforma Fondos Alianza · Vista y Cuasi Vista (todos los fondos)",
    paginas: PLATAFORMA_BOTH_PAGES,
  },
  {
    archivo: UPDATE_CXC_FILE,
    documento: "Update FIC CxC · marzo 2026",
    paginas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    archivo: FICHA_TECNICA_CXC_FILE,
    documento: "Ficha técnica FIC CxC · abril 2026",
    paginas: "all",
  },
  {
    archivo: INFORME_BACKTEST_FILE,
    documento: "Informe Backtest & Stress Test · Abierto vs CxC",
    paginas: "all",
  },
  {
    archivo: INFORME_DESEMPENO_RIESGO_FILE,
    documento: "Análisis Desempeño y Riesgo · Abierto vs CxC (31 métricas)",
    paginas: "all",
  },
  {
    archivo: PROSPECTO_ABIERTO_FILE,
    documento: "Prospecto FIC Abierto · marzo 2026",
    paginas: "all",
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
  paginas: { numero: number; titulo?: string; contenido: string }[];
};

function buildBothFundsExcerpts(): DigestExcerpt[] {
  const excerpts: DigestExcerpt[] = [];

  for (const spec of BOTH_FUNDS_DOC_SPECS) {
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
      return `### ${doc.documento}\n*Archivo JSON: ${doc.archivo}*\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

export type FundAdvisoryBothFundsVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: false;
};

/**
 * Construye el contexto inline para AMBOS fondos (Abierto + CxC).
 */
export function buildFundAdvisoryBothFundsVoiceContext(): FundAdvisoryBothFundsVoiceContextResult {
  const excerpts = buildBothFundsExcerpts();
  const sourceFiles = excerpts.map((e) => e.archivo);
  const corpusMarkdown = buildCorpusMarkdown(excerpts);

  const payload = {
    escenario: "Asesoría especializada · FIC Abierto y FIC CxC (Alianza) — comparativa completa",
    alcance:
      "Este agente responde sobre AMBOS fondos: Fondo Abierto Alianza y Fondo Abierto con Pacto de Permanencia CxC. " +
      "Puede comparar rentabilidad, riesgo, composición, liquidez, comisiones, prospectos y métricas de desempeño entre ambos. " +
      "Usa la Plataforma de Fondos para comparativas generales, el Informe de Desempeño y Riesgo para 31 métricas cuantitativas, " +
      "y el Informe de Backtest para estrés histórico.",
    fuenteUnica:
      "ÚNICA fuente autorizada: 6 archivos JSON digest VLM (Plataforma de Fondos, Update FIC CxC, Ficha técnica CxC, " +
      "Informe Backtest, Informe Desempeño y Riesgo, Prospecto FIC Abierto). " +
      "NO uses cifras de memoria del modelo ni datos fuera de estos JSON.",
    archivosIndexados: sourceFiles,
    resumenComparativoAmbosFondos: {
      nota: "Métricas comparativas extraídas del Informe Desempeño y Riesgo (2017–Mar 2026)",
      fondoAbierto: {
        rentabilidadMediaAnual: "5.53%",
        volatilidadAnual: "0.38%",
        sharpe: 14.63,
        maxDrawdown: "-1.10%",
        maxDrawdownDuracion: "37 días",
        sortino: 26.71,
      },
      fondoCxC: {
        rentabilidadMediaAnual: "6.92%",
        volatilidadAnual: "0.71%",
        sharpe: 9.74,
        maxDrawdown: "-1.33%",
        maxDrawdownDuracion: "35 días",
        sortino: 15.35,
      },
      comparacion: {
        diferenciaRentabilidad: "CxC supera a Abierto en +1.39% anual",
        diferenciaVolatilidad: "Abierto tiene menor volatilidad (0.38% vs 0.71%)",
        mejorSharpe: "Abierto (14.63 vs 9.74)",
        mejorSortino: "Abierto (26.71 vs 15.35)",
        correlacionEntreFondos: 0.25,
      },
    },
    corpusDocumental: excerpts.map((e) => ({
      archivo: e.archivo,
      documento: e.documento,
      paginasIncluidas: e.paginas.map((p) => p.numero),
    })),
    corpusDocumentalMarkdown: corpusMarkdown,
  };

  const context = JSON.stringify(payload);

  return {
    context,
    sourceFiles,
    totalChars: context.length,
    truncated: false,
  };
}
