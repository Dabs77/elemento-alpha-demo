/**
 * Datos de estrés histórico y backtesting.
 *
 * Fuentes oficiales (info2/):
 *   - informe_backtest_(1).pdf            → 8 episodios de estrés 2017-2023,
 *                                          contexto macro y estadísticos generales
 *                                          (Alianza Fondo Abierto vs CXC, ventana 2017-01-01 → 2026-03-31).
 *   - informe_desempeño_riesgo_(1).pdf    → Top-5 drawdowns históricos por fondo
 *                                          (mismo período).
 *
 * Convenciones:
 *   - "Actual"    = Alianza Fondo Abierto (ABIERTO)
 *   - "Sugerido"  = Alianza CxC (Cash Conservador)
 *   - Ganador     = fondo con Δ Retorno > 0,05 pp.
 *   - MaxDD se mide intra-episodio sobre la serie diaria.
 */

export interface StressEpisode {
  id: string;
  nombre: string;
  periodo: string;
  /** Fechas exactas de la ventana (ISO yyyy-mm-dd) según informe oficial. */
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  /** Retorno acumulado del Alianza Fondo Abierto (%) */
  retornoActual: number;
  /** Retorno acumulado del CXC (%) */
  retornoSugerido: number;
  /** Δ Ret. (pp) = sugerido − actual */
  deltaRetorno: number;
  /** Máximo drawdown intra-episodio del fondo Abierto (%) */
  maxDDActual: number;
  /** Máximo drawdown intra-episodio del fondo CxC (%) */
  maxDDSugerido: number;
  ganador: "BMK Actual" | "BMK Sugerido";
  categoria: "global" | "local" | "crisis";
}

export interface EpisodeMacroContext {
  episodeId: string;
  /** Variación del COLCAP en la ventana (%) */
  deltaColcap: number;
  /** Variación del S&P 500 en la ventana (%) */
  deltaSp500: number;
  /** Variación de la TRM (USD/COP) en la ventana (%) */
  deltaTrm: number;
  /** Variación del Brent en la ventana (%) */
  deltaBrent: number;
  /** Variación del índice de TES COL en la ventana (%) */
  deltaCtes: number;
  /** Promedio del CDS soberano Colombia 5Y (bps) */
  cdsColPromedio: number;
  /** Inflación a/a promedio en la ventana (%) */
  ipcPromedio: number;
}

export interface FundDrawdown {
  /** Fecha del pico previo al drawdown (ISO yyyy-mm-dd) */
  pico: string;
  /** Fecha del valle (mínimo) (ISO yyyy-mm-dd) */
  trough: string;
  /** Fecha en que se recupera el pico previo (ISO yyyy-mm-dd) */
  recuperacion: string;
  /** Profundidad máxima del drawdown (%) */
  profundidad: number;
  /** Duración del episodio en días calendario */
  duracionDias: number;
  estado: "Recuperado" | "En curso";
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos del informe — Backtesting & Stress Test
// ─────────────────────────────────────────────────────────────────────────────

export const STRESS_REPORT_META = {
  titulo: "Backtesting & Stress Test — Alianza Fondo Abierto vs CXC",
  ventanaInicio: "2017-01-01",
  ventanaFin: "2026-03-31",
  fechaInforme: "2026-05-15",
  fuentePrimaria: "Elemento Alpha — informe_backtest (1).pdf",
  fuenteSecundaria: "Elemento Alpha — informe_desempeño_riesgo (1).pdf",
  notaGanador: "Se declara ganador al fondo con diferencia mayor a 0,05 pp.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Episodios de estrés (Tabla 1 — informe_backtest, página 2)
// ─────────────────────────────────────────────────────────────────────────────

export const STRESS_EPISODES: StressEpisode[] = [
  {
    id: "ciclo-alzas-fed-2017-18",
    nombre: "Ciclo Alzas FED",
    periodo: "Ene 2017 - Dic 2018",
    fechaInicio: "2017-01-02",
    fechaFin: "2018-12-31",
    dias: 728,
    retornoActual: 9.40,
    retornoSugerido: 14.62,
    deltaRetorno: 5.22,
    maxDDActual: -0.02,
    maxDDSugerido: -0.01,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "covid-19-crash-2020",
    nombre: "COVID-19 Crash",
    periodo: "Feb - Mar 2020",
    fechaInicio: "2020-02-19",
    fechaFin: "2020-03-23",
    dias: 33,
    retornoActual: -0.77,
    retornoSugerido: -0.11,
    deltaRetorno: 0.66,
    maxDDActual: -1.10,
    maxDDSugerido: -0.52,
    ganador: "BMK Sugerido",
    categoria: "crisis",
  },
  {
    id: "recuperacion-post-covid-2020",
    nombre: "Recup. Post-COVID",
    periodo: "Mar - Dic 2020",
    fechaInicio: "2020-03-23",
    fechaFin: "2020-12-31",
    dias: 283,
    retornoActual: 3.70,
    retornoSugerido: 3.81,
    deltaRetorno: 0.11,
    maxDDActual: -0.06,
    maxDDSugerido: -0.04,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "caida-tes-colombia-2021",
    nombre: "Caída TES Col.",
    periodo: "Feb - Oct 2021",
    fechaInicio: "2021-02-01",
    fechaFin: "2021-10-31",
    dias: 272,
    retornoActual: -0.15,
    retornoSugerido: 1.63,
    deltaRetorno: 1.78,
    maxDDActual: -0.54,
    maxDDSugerido: -0.06,
    ganador: "BMK Sugerido",
    categoria: "local",
  },
  {
    id: "inflacion-alzas-tasas-2022",
    nombre: "Inflación & Alzas 22",
    periodo: "Ene - Dic 2022",
    fechaInicio: "2022-01-03",
    fechaFin: "2022-12-30",
    dias: 361,
    retornoActual: 6.17,
    retornoSugerido: 7.77,
    deltaRetorno: 1.60,
    maxDDActual: -0.04,
    maxDDSugerido: -0.07,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "cambio-gobierno-col-2022",
    nombre: "Cambio Gob. Col 22",
    periodo: "Jun - Nov 2022",
    fechaInicio: "2022-06-19",
    fechaFin: "2022-11-30",
    dias: 164,
    retornoActual: 3.57,
    retornoSugerido: 4.46,
    deltaRetorno: 0.89,
    maxDDActual: -0.04,
    maxDDSugerido: -0.03,
    ganador: "BMK Sugerido",
    categoria: "local",
  },
  {
    id: "rally-coltes-2023",
    nombre: "Rally COLTES 23",
    periodo: "Jul - Dic 2023",
    fechaInicio: "2023-07-01",
    fechaFin: "2023-12-29",
    dias: 181,
    retornoActual: 6.29,
    retornoSugerido: 5.70,
    deltaRetorno: -0.59,
    maxDDActual: -0.22,
    maxDDSugerido: -0.06,
    ganador: "BMK Actual",
    categoria: "local",
  },
  {
    id: "normalizacion-tasas-2023",
    nombre: "Normaliz. Tasas 23",
    periodo: "Ene - Dic 2023",
    fechaInicio: "2023-01-02",
    fechaFin: "2023-12-29",
    dias: 361,
    retornoActual: 13.57,
    retornoSugerido: 10.51,
    deltaRetorno: -3.06,
    maxDDActual: -0.22,
    maxDDSugerido: -1.33,
    ganador: "BMK Actual",
    categoria: "global",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Contexto macroeconómico por episodio (Tabla 2 — informe_backtest, página 3)
// ─────────────────────────────────────────────────────────────────────────────

export const EPISODE_MACRO_CONTEXT: EpisodeMacroContext[] = [
  {
    episodeId: "ciclo-alzas-fed-2017-18",
    deltaColcap: -1.48,
    deltaSp500: 11.97,
    deltaTrm: 8.30,
    deltaBrent: -5.32,
    deltaCtes: 16.21,
    cdsColPromedio: 121.1,
    ipcPromedio: 3.88,
  },
  {
    episodeId: "covid-19-crash-2020",
    deltaColcap: -44.69,
    deltaSp500: -27.45,
    deltaTrm: 19.96,
    deltaBrent: -54.22,
    deltaCtes: -12.24,
    cdsColPromedio: 177.4,
    ipcPromedio: 3.69,
  },
  {
    episodeId: "recuperacion-post-covid-2020",
    deltaColcap: 55.69,
    deltaSp500: 53.48,
    deltaTrm: -15.87,
    deltaBrent: 90.79,
    deltaCtes: 24.14,
    cdsColPromedio: 149.6,
    ipcPromedio: 2.41,
  },
  {
    episodeId: "caida-tes-colombia-2021",
    deltaColcap: 1.88,
    deltaSp500: 20.58,
    deltaTrm: 6.26,
    deltaBrent: 47.42,
    deltaCtes: -7.77,
    cdsColPromedio: 134.8,
    ipcPromedio: 2.98,
  },
  {
    episodeId: "inflacion-alzas-tasas-2022",
    deltaColcap: -9.68,
    deltaSp500: -19.90,
    deltaTrm: 17.82,
    deltaBrent: 7.39,
    deltaCtes: -11.54,
    cdsColPromedio: 259.7,
    ipcPromedio: 9.59,
  },
  {
    episodeId: "cambio-gobierno-col-2022",
    deltaColcap: -15.03,
    deltaSp500: 10.93,
    deltaTrm: 23.32,
    deltaBrent: -23.88,
    deltaCtes: -0.80,
    cdsColPromedio: 296.6,
    ipcPromedio: 10.78,
  },
  {
    episodeId: "rally-coltes-2023",
    deltaColcap: 5.43,
    deltaSp500: 7.18,
    deltaTrm: -8.51,
    deltaBrent: 2.86,
    deltaCtes: 6.78,
    cdsColPromedio: 213.1,
    ipcPromedio: 11.15,
  },
  {
    episodeId: "normalizacion-tasas-2023",
    deltaColcap: -5.86,
    deltaSp500: 24.73,
    deltaTrm: -20.54,
    deltaBrent: -6.16,
    deltaCtes: 29.97,
    cdsColPromedio: 246.0,
    ipcPromedio: 12.08,
  },
];

export function getMacroContext(episodeId: string): EpisodeMacroContext | undefined {
  return EPISODE_MACRO_CONTEXT.find((m) => m.episodeId === episodeId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-5 drawdowns históricos por fondo (Tablas 2 y 3 — informe_desempeño_riesgo)
// Ventana 2017-01-01 → 2026-03-31
// ─────────────────────────────────────────────────────────────────────────────

export const TOP_DRAWDOWNS_ABIERTO: FundDrawdown[] = [
  { pico: "2020-03-08", trough: "2020-03-19", recuperacion: "2020-04-14", profundidad: -1.10, duracionDias: 37, estado: "Recuperado" },
  { pico: "2021-02-15", trough: "2021-03-30", recuperacion: "2022-02-13", profundidad: -0.54, duracionDias: 363, estado: "Recuperado" },
  { pico: "2023-10-02", trough: "2023-10-06", recuperacion: "2023-10-13", profundidad: -0.22, duracionDias: 11, estado: "Recuperado" },
  { pico: "2026-01-04", trough: "2026-01-09", recuperacion: "2026-01-16", profundidad: -0.09, duracionDias: 12, estado: "Recuperado" },
  { pico: "2023-09-20", trough: "2023-09-22", recuperacion: "2023-09-28", profundidad: -0.06, duracionDias: 8, estado: "Recuperado" },
];

export const TOP_DRAWDOWNS_CXC: FundDrawdown[] = [
  { pico: "2023-01-31", trough: "2023-02-01", recuperacion: "2023-03-07", profundidad: -1.33, duracionDias: 35, estado: "Recuperado" },
  { pico: "2020-03-08", trough: "2020-03-16", recuperacion: "2020-03-31", profundidad: -0.52, duracionDias: 23, estado: "Recuperado" },
  { pico: "2021-11-02", trough: "2021-11-04", recuperacion: "2021-11-27", profundidad: -0.09, duracionDias: 25, estado: "Recuperado" },
  { pico: "2022-03-21", trough: "2022-03-24", recuperacion: "2022-03-30", profundidad: -0.07, duracionDias: 9, estado: "Recuperado" },
  { pico: "2023-10-04", trough: "2023-10-06", recuperacion: "2023-10-10", profundidad: -0.06, duracionDias: 6, estado: "Recuperado" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Estadísticos resumen
// ─────────────────────────────────────────────────────────────────────────────

export const STRESS_SUMMARY = {
  totalEpisodios: STRESS_EPISODES.length,
  victoriasBMKSugerido: STRESS_EPISODES.filter((e) => e.ganador === "BMK Sugerido").length,
  victoriasBMKActual: STRESS_EPISODES.filter((e) => e.ganador === "BMK Actual").length,
  promedioRetornoActual:
    STRESS_EPISODES.reduce((acc, e) => acc + e.retornoActual, 0) / STRESS_EPISODES.length,
  promedioRetornoSugerido:
    STRESS_EPISODES.reduce((acc, e) => acc + e.retornoSugerido, 0) / STRESS_EPISODES.length,
  peorMaxDDActual: Math.min(...STRESS_EPISODES.map((e) => e.maxDDActual)),
  peorMaxDDSugerido: Math.min(...STRESS_EPISODES.map((e) => e.maxDDSugerido)),
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getEpisodesByCategory(categoria: StressEpisode["categoria"]): StressEpisode[] {
  return STRESS_EPISODES.filter((e) => e.categoria === categoria);
}

export function formatRetorno(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatMaxDD(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDeltaMacro(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
