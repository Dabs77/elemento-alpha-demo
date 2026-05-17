/**
 * Servicio para cargar y parsear los JSON de fondos (VLM digest).
 * Extrae datos estructurados de FIC Abierto, FIC CxC y Plataforma de Fondos.
 */

import type { PdfVlmDigestResult, PdfPageVlmExtraction } from "@/lib/onboarding/pdfVlmDigestTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface FundBasicInfo {
  nombre: string;
  aums: string;
  calificacionCredito: string;
  calificacionMercado: string;
  liquidez: string;
  duracionActivo: string;
  perfilRiesgo: string;
  inicioOperaciones: string;
  inversionistas: string;
}

export interface FundPerformanceMetrics {
  rentabilidadUltimoMes: string;
  rentabilidadTrimestre: string;
  rentabilidadAnoCorrido: string;
  rentabilidadUltimos3Anos: string;
  volatilidad: string;
  diasNegativosYTD: string;
  diasNegativosUltimos8Anos: string;
  maxDrawdown?: string;
}

export interface FundComposition {
  porCalificacion: { label: string; porcentaje: string }[];
  porTipoRenta: { label: string; porcentaje: string }[];
  porSector: { label: string; porcentaje: string }[];
}

export interface FundData {
  basicInfo: FundBasicInfo;
  performance: FundPerformanceMetrics;
  composition: FundComposition;
  markdownPages: { pageNumber: number; content: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos extraídos de los JSON (hardcoded para demo, basados en VLM digest)
// ─────────────────────────────────────────────────────────────────────────────

export const FIC_ABIERTO_DATA: FundData = {
  basicInfo: {
    nombre: "FIC Abierto Alianza",
    aums: "$8.76 billones",
    calificacionCredito: "F-AAA (BRC Standard & Poor's)",
    calificacionMercado: "2+ (BRC Standard & Poor's)",
    liquidez: "Vista (sin pacto de permanencia)",
    duracionActivo: "135 días",
    perfilRiesgo: "Conservador",
    inicioOperaciones: "Agosto 1989 (36 años de operación)",
    inversionistas: "102,844",
  },
  performance: {
    rentabilidadUltimoMes: "10.03% E.A.",
    rentabilidadTrimestre: "7.54% E.A.",
    rentabilidadAnoCorrido: "7.54% E.A.",
    rentabilidadUltimos3Anos: "9.16% E.A.",
    volatilidad: "0.32%",
    diasNegativosYTD: "10 días",
    diasNegativosUltimos8Anos: "9 meses",
    maxDrawdown: "-16.89% (02 Feb 2026)",
  },
  composition: {
    porCalificacion: [
      { label: "AAA", porcentaje: "85.2%" },
      { label: "AA+", porcentaje: "8.3%" },
      { label: "AA", porcentaje: "4.1%" },
      { label: "Otros", porcentaje: "2.4%" },
    ],
    porTipoRenta: [
      { label: "Tasa Fija", porcentaje: "62.5%" },
      { label: "IBR", porcentaje: "18.3%" },
      { label: "DTF", porcentaje: "12.1%" },
      { label: "Liquidez", porcentaje: "7.1%" },
    ],
    porSector: [
      { label: "Sector Financiero", porcentaje: "58.4%" },
      { label: "Gobierno", porcentaje: "24.2%" },
      { label: "Sector Real", porcentaje: "12.8%" },
      { label: "Otros", porcentaje: "4.6%" },
    ],
  },
  markdownPages: [],
};

export const FIC_CXC_DATA: FundData = {
  basicInfo: {
    nombre: "FIC CxC Alianza",
    aums: "$5.55 billones",
    calificacionCredito: "F-AAA (Value & Risk Rating)",
    calificacionMercado: "VrM 1 (Value & Risk Rating)",
    liquidez: "Pacto de permanencia 30 días",
    duracionActivo: "540 días (1.48 años)",
    perfilRiesgo: "Moderado",
    inicioOperaciones: "Abril 1995 (31 años de operación)",
    inversionistas: "≈ 25,000",
  },
  performance: {
    rentabilidadUltimoMes: "10.71% E.A.",
    rentabilidadTrimestre: "9.37% E.A.",
    rentabilidadAnoCorrido: "9.37% E.A.",
    rentabilidadUltimos3Anos: "10.59% E.A.",
    volatilidad: "0.31%",
    diasNegativosYTD: "6 días",
    diasNegativosUltimos8Anos: "0 meses",
    maxDrawdown: "-17.03% (02 Feb 2026)",
  },
  composition: {
    porCalificacion: [
      { label: "NR (No Rating)", porcentaje: "47.9%" },
      { label: "AAA", porcentaje: "28.3%" },
      { label: "Riesgo Nación", porcentaje: "17.2%" },
      { label: "NR Internacional", porcentaje: "3.7%" },
      { label: "Otros", porcentaje: "2.9%" },
    ],
    porTipoRenta: [
      { label: "Tasa Fija", porcentaje: "54.5%" },
      { label: "Títulos Participativos", porcentaje: "35.9%" },
      { label: "R. Variable Dólar", porcentaje: "3.4%" },
      { label: "Liquidez", porcentaje: "3.1%" },
      { label: "Otros", porcentaje: "3.1%" },
    ],
    porSector: [
      { label: "Sector Financiero", porcentaje: "49.9%" },
      { label: "Otros (DCE)", porcentaje: "25.0%" },
      { label: "Entidades Públicas", porcentaje: "17.2%" },
      { label: "Sector Real", porcentaje: "7.9%" },
    ],
  },
  markdownPages: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Comparativa de fondos (datos de Plataforma de Fondos y Cuantavista)
// ─────────────────────────────────────────────────────────────────────────────

export interface FundComparisonRow {
  metrica: string;
  ficAbierto: string;
  ficCxC: string;
  destacado?: "abierto" | "cxc" | "empate";
}

export const FUND_COMPARISON_TABLE: FundComparisonRow[] = [
  { metrica: "Estrategia", ficAbierto: "Money Market (duración 150-300 días)", ficCxC: "Alternativos locales + liquidez + RF short duration", destacado: "empate" },
  { metrica: "AUMs", ficAbierto: "$8.76 Bn", ficCxC: "$5.55 Bn", destacado: "abierto" },
  { metrica: "Calificación Crédito", ficAbierto: "AAA (BRC)", ficCxC: "AAA (V&R)", destacado: "empate" },
  { metrica: "Calificación Mercado", ficAbierto: "2+", ficCxC: "VrM 1", destacado: "cxc" },
  { metrica: "Liquidez", ficAbierto: "Vista", ficCxC: "Pacto 30 días", destacado: "abierto" },
  { metrica: "Duración Activo", ficAbierto: "135 días", ficCxC: "540 días", destacado: "empate" },
  { metrica: "Rent. Último Mes", ficAbierto: "10.03% E.A.", ficCxC: "10.71% E.A.", destacado: "cxc" },
  { metrica: "Rent. Año Corrido", ficAbierto: "7.54% E.A.", ficCxC: "9.37% E.A.", destacado: "cxc" },
  { metrica: "Rent. Últimos 3 Años", ficAbierto: "9.16% E.A.", ficCxC: "10.59% E.A.", destacado: "cxc" },
  { metrica: "Volatilidad YTD", ficAbierto: "0.32%", ficCxC: "0.31%", destacado: "cxc" },
  { metrica: "Días Negativos YTD", ficAbierto: "10 días", ficCxC: "6 días", destacado: "cxc" },
  { metrica: "Meses Negativos (8 años)", ficAbierto: "9 meses", ficCxC: "0 meses", destacado: "cxc" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Funciones de carga de JSON (para uso futuro con archivos dinámicos)
// ─────────────────────────────────────────────────────────────────────────────

export function getPageMarkdown(digest: PdfVlmDigestResult, pageNumber: number): string | null {
  const page = digest.pages.find((p) => p.pageNumber === pageNumber);
  return page?.markdownCompleto ?? null;
}

export function getPagesByRange(digest: PdfVlmDigestResult, start: number, end: number): PdfPageVlmExtraction[] {
  return digest.pages.filter((p) => p.pageNumber >= start && p.pageNumber <= end);
}

export function extractFullMarkdownForPages(digest: PdfVlmDigestResult, pageNumbers: number[]): string {
  return pageNumbers
    .map((n) => getPageMarkdown(digest, n))
    .filter(Boolean)
    .join("\n\n---\n\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers para formateo
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
