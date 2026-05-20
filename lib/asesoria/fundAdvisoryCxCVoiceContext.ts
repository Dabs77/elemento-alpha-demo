import fs from "fs";
import path from "path";
import type { PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";

/**
 * Contexto de voz CxC: solo lee 3 archivos de /info2 y arma un corpus
 * enfocado únicamente en el Fondo Abierto con Pacto de Permanencia CxC
 * (Alianza Fiduciaria). NO depende de BrainBox ni de RAG remoto: todo es
 * inline y se inyecta como systemInstruction (o por chunks si excede el
 * límite inline).
 */

const INFO_DIR = path.join(process.cwd(), "info2");

const PLATAFORMA_FILE = "Plataforma_de_Fondos_y_Cuantavista.pdf-vlm-digest.json";
const UPDATE_CXC_FILE = "Update_FIC_CxC_Marzo_2026.pdf-vlm-digest.json";
const FICHA_TECNICA_CXC_FILE = "FIC_CxC_Abril_2026_1_.pdf-vlm-digest.json";
const INFORME_BACKTEST_FILE = "informe_backtest_1_.pdf-vlm-digest.json";

/**
 * Páginas de la Plataforma (35 en total) que aportan valor para CxC.
 * Se EXCLUYEN explícitamente:
 *  - 15 (header "Anexo 1 – Comisiones", sin datos)
 *  - 16, 17, 18 (comisiones específicas de Fondo Abierto, Cash y RF 90)
 *  - 20 (header "Anexo 2", sin datos)
 *  - 25–34 (view económico macro y desempeño de activos en general)
 *
 * Las comparativas (3, 4, 5, 6, 7, 10–14, 21–24) se conservan porque
 * incluyen la columna CxC junto al resto de fondos. El agente recibe la
 * instrucción de hablar SOLO de CxC; usa las otras columnas como referencia
 * implícita pero no contesta sobre ellas.
 */
const PLATAFORMA_CXC_PAGES: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 19, 21, 22, 23, 24, 35,
];

type CxCDocSpec = {
  archivo: string;
  documento: string;
  paginas: number[] | "all";
};

const CXC_DOC_SPECS: CxCDocSpec[] = [
  {
    archivo: PLATAFORMA_FILE,
    documento: "Plataforma Fondos Alianza · Vista y Cuasi Vista (filtrado a CxC)",
    paginas: PLATAFORMA_CXC_PAGES,
  },
  {
    archivo: UPDATE_CXC_FILE,
    documento: "Update FIC CxC · marzo 2026",
    paginas: "all",
  },
  {
    archivo: FICHA_TECNICA_CXC_FILE,
    documento: "Ficha técnica FIC CxC · abril 2026",
    paginas: "all",
  },
  {
    archivo: INFORME_BACKTEST_FILE,
    documento: "Informe Backtest & Stress Test CxC · mayo 2026 (solo datos CxC y contexto macro)",
    paginas: [2, 3],
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

function buildCxCExcerpts(): DigestExcerpt[] {
  const excerpts: DigestExcerpt[] = [];

  for (const spec of CXC_DOC_SPECS) {
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

export type FundAdvisoryCxCVoiceContextResult = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: false;
};

/**
 * Construye el contexto inline CxC-only.
 * El payload incluye tanto un mapa estructurado (`corpusDocumental`)
 * como el markdown plano (`corpusDocumentalMarkdown`).
 */
export function buildFundAdvisoryCxCVoiceContext(): FundAdvisoryCxCVoiceContextResult {
  const excerpts = buildCxCExcerpts();
  const sourceFiles = excerpts.map((e) => e.archivo);
  const corpusMarkdown = buildCorpusMarkdown(excerpts);

  const payload = {
    escenario: "Asesoría especializada · FIC CxC (Alianza) — alcance restringido",
    alcanceUnicoFondo:
      "Este agente responde EXCLUSIVAMENTE sobre el Fondo Abierto con Pacto de Permanencia CxC de Alianza Fiduciaria. " +
      "No responde sobre FIC Abierto, Cash Conservador, RF 90 ni ningún otro fondo distinto a CxC. " +
      "En la Plataforma de Fondos hay tablas comparativas con varios fondos: usa SOLO la columna CxC. " +
      "En el informe de Backtest hay comparaciones con Fondo Abierto: menciona SOLO los datos de CxC (columnas 'Ret. Sugerido', 'MaxDD Sugerido', fila CXC).",
    notaEstresEconomico:
      "Para consultas sobre ESTRÉS ECONÓMICO, DRAWDOWNS, EPISODIOS DE CRISIS, CONTEXTO MACRO o VOLATILIDAD HISTÓRICA, " +
      "usa los datos de 'datosEstresEconomicoYMacroCxC' más abajo. Solo menciona datos del CxC, no de otros fondos.",
    datosEstresEconomicoYMacroCxC: {
      descripcion: "Datos extraídos del Informe Backtest & Stress Test (solo columnas CxC)",
      retornosYDrawdownsCxCPorEpisodio: [
        { episodio: "Ciclo Alzas FED", periodo: "2017-01-02 / 2018-12-31", dias: 728, retornoCxC: "+14.62%", maxDDCxC: "-0.01%" },
        { episodio: "COVID-19 Crash", periodo: "2020-02-19 / 2020-03-23", dias: 33, retornoCxC: "-0.11%", maxDDCxC: "-0.52%" },
        { episodio: "Recup. Post-COVID", periodo: "2020-03-23 / 2020-12-31", dias: 283, retornoCxC: "+3.81%", maxDDCxC: "-0.04%" },
        { episodio: "Caída TES Col.", periodo: "2021-02-01 / 2021-10-31", dias: 272, retornoCxC: "+1.63%", maxDDCxC: "-0.06%" },
        { episodio: "Inflación & Alzas 22", periodo: "2022-01-03 / 2022-12-30", dias: 361, retornoCxC: "+7.77%", maxDDCxC: "-0.07%" },
        { episodio: "Cambio Gob. Col 22", periodo: "2022-06-19 / 2022-11-30", dias: 164, retornoCxC: "+4.46%", maxDDCxC: "-0.03%" },
        { episodio: "Rally COLTES 23", periodo: "2023-07-01 / 2023-12-29", dias: 181, retornoCxC: "+5.70%", maxDDCxC: "-0.06%" },
        { episodio: "Normaliz. Tasas 23", periodo: "2023-01-02 / 2023-12-29", dias: 361, retornoCxC: "+10.51%", maxDDCxC: "-1.33%" },
      ],
      contextoMacroPorEpisodio: [
        { episodio: "Ciclo Alzas FED", deltaCOLCAP: "-1.48%", deltaSP500: "+11.97%", deltaTRM: "+8.30%", deltaBrent: "-5.32%", deltaCTES: "+16.21%", CDSCol: 121.1, IPCaa: "3.88%" },
        { episodio: "COVID-19 Crash", deltaCOLCAP: "-44.69%", deltaSP500: "-27.45%", deltaTRM: "+19.96%", deltaBrent: "-54.22%", deltaCTES: "-12.24%", CDSCol: 177.4, IPCaa: "3.69%" },
        { episodio: "Recup. Post-COVID", deltaCOLCAP: "+55.69%", deltaSP500: "+53.48%", deltaTRM: "-15.87%", deltaBrent: "+90.79%", deltaCTES: "+24.14%", CDSCol: 149.6, IPCaa: "2.41%" },
        { episodio: "Caída TES Col.", deltaCOLCAP: "+1.88%", deltaSP500: "+20.58%", deltaTRM: "+6.26%", deltaBrent: "+47.42%", deltaCTES: "-7.77%", CDSCol: 134.8, IPCaa: "2.98%" },
        { episodio: "Inflación & Alzas 22", deltaCOLCAP: "-9.68%", deltaSP500: "-19.90%", deltaTRM: "+17.82%", deltaBrent: "+7.39%", deltaCTES: "-11.54%", CDSCol: 259.7, IPCaa: "9.59%" },
        { episodio: "Cambio Gob. Col 22", deltaCOLCAP: "-15.03%", deltaSP500: "+10.93%", deltaTRM: "+23.32%", deltaBrent: "-23.88%", deltaCTES: "-0.80%", CDSCol: 296.6, IPCaa: "10.78%" },
        { episodio: "Rally COLTES 23", deltaCOLCAP: "+5.43%", deltaSP500: "+7.18%", deltaTRM: "-8.51%", deltaBrent: "+2.86%", deltaCTES: "+6.78%", CDSCol: 213.1, IPCaa: "11.15%" },
        { episodio: "Normaliz. Tasas 23", deltaCOLCAP: "-5.86%", deltaSP500: "+24.73%", deltaTRM: "-20.54%", deltaBrent: "-6.16%", deltaCTES: "+29.97%", CDSCol: 246.0, IPCaa: "12.08%" },
      ],
      estadisticosGeneralesCxC: {
        periodo: "2017–Mar 2026",
        rentabilidadMediaAnual: "+6.92%",
        volatilidadAnual: "0.71%",
        sharpe: 9.74,
        correlaciones: { COLCAP: 0.02, SP500: -0.04, TRM: -0.04, CTES: 0.01, Brent: 0.00 },
      },
      evolucionNAVNormalizadoCxC: {
        base: "100 = 2-ene-2017",
        valores: { "2017": 100, "2018": 108, "2019": 115, "2020": 122, "2021": 127, "2022": 130, "2023": 140, "2024": 155, "2025": 172, "2026": 190 },
      },
    },
    fuenteUnica:
      "ÚNICA fuente autorizada: 4 archivos JSON digest VLM (Plataforma de Fondos filtrada a páginas CxC, " +
      "Update FIC CxC Marzo 2026, Ficha técnica FIC CxC Abril 2026, e Informe Backtest solo datos CxC y macro). " +
      "NO uses cifras de memoria del modelo ni datos fuera de estos JSON.",
    archivosIndexados: sourceFiles,
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
