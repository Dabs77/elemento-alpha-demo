/**
 * Datos de los 12 episodios históricos de estrés de mercado.
 * Fuente: Backtesting & Stress — BMK Genérico vs BMK Sugerido (2014 - Mar 2026)
 */

export interface StressEpisode {
  id: string;
  nombre: string;
  periodo: string;
  dias: number;
  retornoActual: number;
  retornoSugerido: number;
  deltaRetorno: number;
  maxDDActual: number;
  maxDDSugerido: number;
  ganador: "BMK Actual" | "BMK Sugerido";
  categoria: "global" | "local" | "crisis";
}

export const STRESS_EPISODES: StressEpisode[] = [
  {
    id: "crisis-tapering-fed-2015",
    nombre: "Crisis Tapering FED (2015)",
    periodo: "May-Dic 2015",
    dias: 245,
    retornoActual: 5.74,
    retornoSugerido: 7.05,
    deltaRetorno: 1.31,
    maxDDActual: -2.52,
    maxDDSugerido: -3.11,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "caida-petroleo-em-2015-16",
    nombre: "Caída Petróleo & EM (2015-16)",
    periodo: "Jun 15-Feb 16",
    dias: 274,
    retornoActual: 5.50,
    retornoSugerido: 5.61,
    deltaRetorno: 0.11,
    maxDDActual: -2.52,
    maxDDSugerido: -3.11,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "brexit-2016",
    nombre: "Brexit (2016)",
    periodo: "Jun-Jul 2016",
    dias: 61,
    retornoActual: 2.67,
    retornoSugerido: 2.66,
    deltaRetorno: -0.01,
    maxDDActual: -1.12,
    maxDDSugerido: -1.47,
    ganador: "BMK Actual",
    categoria: "global",
  },
  {
    id: "ciclo-alzas-fed-2017-18",
    nombre: "Ciclo Alzas FED (2017-18)",
    periodo: "Ene 17-Dic 18",
    dias: 730,
    retornoActual: 16.90,
    retornoSugerido: 17.74,
    deltaRetorno: 0.84,
    maxDDActual: -2.02,
    maxDDSugerido: -2.35,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "covid-19-crash-2020",
    nombre: "COVID-19 Crash (2020)",
    periodo: "Feb-Abr 2020",
    dias: 90,
    retornoActual: -1.72,
    retornoSugerido: -0.80,
    deltaRetorno: 0.92,
    maxDDActual: -12.39,
    maxDDSugerido: -11.51,
    ganador: "BMK Sugerido",
    categoria: "crisis",
  },
  {
    id: "recuperacion-post-covid-2020",
    nombre: "Recuperación Post-COVID (2020)",
    periodo: "Abr-Dic 2020",
    dias: 275,
    retornoActual: 15.29,
    retornoSugerido: 15.28,
    deltaRetorno: -0.01,
    maxDDActual: -1.71,
    maxDDSugerido: -1.73,
    ganador: "BMK Actual",
    categoria: "global",
  },
  {
    id: "inflacion-alzas-tasas-2022",
    nombre: "Inflación & Alzas Tasas (2022)",
    periodo: "Ene-Dic 2022",
    dias: 365,
    retornoActual: -3.98,
    retornoSugerido: -3.10,
    deltaRetorno: 0.88,
    maxDDActual: -10.56,
    maxDDSugerido: -10.73,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "normalizacion-tasas-2023",
    nombre: "Normalización Tasas (2023)",
    periodo: "Ene-Dic 2023",
    dias: 365,
    retornoActual: 18.62,
    retornoSugerido: 19.61,
    deltaRetorno: 0.99,
    maxDDActual: -4.32,
    maxDDSugerido: -3.33,
    ganador: "BMK Sugerido",
    categoria: "global",
  },
  {
    id: "caida-tes-colombia-2021",
    nombre: "Caída TES Colombia (2021)",
    periodo: "Feb-Oct 2021",
    dias: 273,
    retornoActual: 0.35,
    retornoSugerido: 1.43,
    deltaRetorno: 1.08,
    maxDDActual: -3.94,
    maxDDSugerido: -3.50,
    ganador: "BMK Sugerido",
    categoria: "local",
  },
  {
    id: "rally-coltes-2023",
    nombre: "Rally COLTES (2023)",
    periodo: "Jul-Dic 2023",
    dias: 184,
    retornoActual: 5.01,
    retornoSugerido: 5.03,
    deltaRetorno: 0.02,
    maxDDActual: -4.32,
    maxDDSugerido: -3.33,
    ganador: "BMK Sugerido",
    categoria: "local",
  },
  {
    id: "cambio-gobierno-col-2022",
    nombre: "Cambio de Gobierno Col (2022)",
    periodo: "Jun-Oct 2022",
    dias: 153,
    retornoActual: -0.31,
    retornoSugerido: 1.19,
    deltaRetorno: 1.50,
    maxDDActual: -3.92,
    maxDDSugerido: -3.90,
    ganador: "BMK Sugerido",
    categoria: "local",
  },
];

// Estadísticas resumidas
export const STRESS_SUMMARY = {
  totalEpisodios: STRESS_EPISODES.length,
  victoriasBMKSugerido: STRESS_EPISODES.filter((e) => e.ganador === "BMK Sugerido").length,
  victoriasBMKActual: STRESS_EPISODES.filter((e) => e.ganador === "BMK Actual").length,
  promedioRetornoActual: STRESS_EPISODES.reduce((acc, e) => acc + e.retornoActual, 0) / STRESS_EPISODES.length,
  promedioRetornoSugerido: STRESS_EPISODES.reduce((acc, e) => acc + e.retornoSugerido, 0) / STRESS_EPISODES.length,
  peorMaxDDActual: Math.min(...STRESS_EPISODES.map((e) => e.maxDDActual)),
  peorMaxDDSugerido: Math.min(...STRESS_EPISODES.map((e) => e.maxDDSugerido)),
};

// Episodios por categoría
export function getEpisodesByCategory(categoria: StressEpisode["categoria"]): StressEpisode[] {
  return STRESS_EPISODES.filter((e) => e.categoria === categoria);
}

// Formateo para display
export function formatRetorno(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatMaxDD(value: number): string {
  return `${value.toFixed(2)}%`;
}
