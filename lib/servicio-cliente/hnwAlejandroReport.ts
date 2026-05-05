/**
 * Datos demo · servicio al cliente (informe y satélites).
 * Cliente ficha: Acropolis Labs SAS (PJ).
 */

export type KeyValueRow = { label: string; value: string };

export type BenchmarkRow = {
  component: string;
  weightPct: string;
  frequency: string;
};

export type AllocationRow = {
  clase: string;
  objetivoPct: string;
  actualPct: string;
  nota?: string;
};

export type ComparisonMetricRow = {
  metric: string;
  portfolio: string;
  benchmark: string;
  alpha: string;
};

export type AlertRow = {
  status: "warning" | "ok";
  alerta: string;
  accionSugerida: string;
};

export type MacroRow = {
  variable: string;
  actual: string;
  anterior: string;
  tendencia: string;
};

export type RebalanceRow = {
  item: string;
  actual: string;
  propuesto: string;
  notaEstrategica: string;
};

export const HNW_CLIENT_DEMO = {
  expedienteId: "ACL-2026-Q1",
  nombre: "Acropolis Labs SAS",
  tipoCliente: "Persona Jurídica",
  perfilRiesgo: "Moderado",
  horizonte: "Corto Plazo (1–3 años)",
  monedaBase: "COP",
  patrimonioTotal: "COP $14.038.561",
  asesor: "Equipo Elemento Alpha — Asesoría Personalizada HNW",
  fechaElaboracion: "Abril 2026",
  proximaRevision: "Julio 2026 (trimestral)",
} as const;

export const CLIENT_SHEET_ROWS: KeyValueRow[] = [
  { label: "Cliente", value: HNW_CLIENT_DEMO.nombre },
  { label: "Tipo de cliente", value: HNW_CLIENT_DEMO.tipoCliente },
  { label: "Perfil de riesgo", value: HNW_CLIENT_DEMO.perfilRiesgo },
  { label: "Horizonte de inversión", value: HNW_CLIENT_DEMO.horizonte },
  { label: "Moneda base", value: HNW_CLIENT_DEMO.monedaBase },
  { label: "Patrimonio total estimado", value: HNW_CLIENT_DEMO.patrimonioTotal },
  { label: "Asesor responsable", value: HNW_CLIENT_DEMO.asesor },
  { label: "Fecha de elaboración", value: HNW_CLIENT_DEMO.fechaElaboracion },
  { label: "Próxima revisión", value: HNW_CLIENT_DEMO.proximaRevision },
];

export const BENCHMARK_REFERENCE_ROWS: BenchmarkRow[] = [
  { component: "IBR 12M (FPCOIBRB12M)", weightPct: "40%", frequency: "Mensual" },
  { component: "COLTES Corto Plazo", weightPct: "30%", frequency: "Mensual" },
  { component: "ICOLCAP (15%) + ACWI COP (15%)", weightPct: "30%", frequency: "Mensual" },
];

/** 2.1 · asignación objetivo vs estado cuenta (sintético alineado al brief). */
export const ALLOCATION_OBJECTIVE_ROWS: AllocationRow[] = [
  { clase: "Liquidez / vista / IBR hasta 3M", objetivoPct: "≥15%", actualPct: "16%", nota: "Cumple restricción mínima" },
  { clase: "Renta fija COP / soberano-collectivo", objetivoPct: "≈45–50%", actualPct: "44%", nota: "Núcleo defensivo" },
  { clase: "Renta fija global (USD)", objetivoPct: "≈8–12%", actualPct: "10%", nota: "T-Bills / corta duración" },
  { clase: "Renta variable (local + global)", objetivoPct: "≤25%", actualPct: "25%", nota: "En techo regulatorio modelo" },
  { clase: "Activos alternativos (FIC finca raíz)", objetivoPct: "≤10%", actualPct: "5%", nota: "Real asset demo" },
];

export const DISTRIBUTION_BY_CURRENCY =
  "COP: 77% — USD / USD-COP: 23%";

export const DISTRIBUTION_BY_ASSET_TYPE =
  "Renta Fija COP: 60% | Renta Variable: 25% | Real Asset: 5% | RF Global: 10%";

export const COMPARISON_VS_BENCHMARK: ComparisonMetricRow[] = [
  { metric: "Rendimiento YTD", portfolio: "+1,96%", benchmark: "+1,61%", alpha: "+0,35%" },
  { metric: "Rendimiento 1 Año", portfolio: "+10,83%", benchmark: "+9,20%", alpha: "+1,63%" },
  { metric: "Volatilidad estimada", portfolio: "4,8%", benchmark: "3,9%", alpha: "—" },
  { metric: "Sharpe Ratio (estimado)", portfolio: "1,42", benchmark: "1,18", alpha: "+0,24" },
];

export const ACTIVE_ALERTS: AlertRow[] = [
  {
    status: "warning",
    alerta:
      "ACWI COP: caída -6,54% YTD por fortalecimiento del peso colombiano (TRM bajó de $4.207 a $3.673)",
    accionSugerida: "Evaluar cobertura cambiaria o reducción marginal de posición global",
  },
  {
    status: "warning",
    alerta:
      "Renta Fija Global (USD): -1,07% YTD. La Fed mantiene tasas altas, afectando precios de bonos",
    accionSugerida: "Acortar duración en RF global. Privilegiar T-Bills vs. bonos 3-7Y",
  },
  {
    status: "ok",
    alerta:
      "ICOLCAP: +13,25% YTD — supera benchmark local. Recuperación del mercado accionario colombiano",
    accionSugerida: "Tomar utilidades parciales (5% del total) para financiar rebalanceo hacia IBR",
  },
];

export const MACRO_CONTEXT_Q1: MacroRow[] = [
  { variable: "TRM (COP/USD)", actual: "$3.673,20", anterior: "$4.207,45", tendencia: "⬇ COP se fortalece" },
  { variable: "Tasa Banrep", actual: "9,25%", anterior: "10,75%", tendencia: "⬇ Ciclo bajista" },
  { variable: "Inflación Colombia (IPC)", actual: "5,8% anual", anterior: "7,2% anual", tendencia: "⬇ Convergiendo" },
  { variable: "IBR Overnight", actual: "9,20%", anterior: "10,65%", tendencia: "⬇ Sigue a Banrep" },
  { variable: "Fed Funds Rate", actual: "4,50%", anterior: "4,50%", tendencia: "→ Sin cambio" },
  { variable: "S&P 500 (YTD)", actual: "-4,6% USD", anterior: "+8,2%", tendencia: "⬇ Corrección técnica" },
  { variable: "ICOLCAP (YTD)", actual: "+13,25%", anterior: "+2,1%", tendencia: "⬆ Fuerte recuperación" },
  { variable: "Petróleo WTI (USD)", actual: "$72,40", anterior: "$78,90", tendencia: "⬇ Presión a la baja" },
];

export const REBALANCE_Q2_2026_ROWS: RebalanceRow[] = [
  {
    item: "ACWI COP / RV global",
    actual: "12%",
    propuesto: "9%",
    notaEstrategica: "Reducción marginal + revisión cobertura TRM (skill PM)",
  },
  {
    item: "Utilidades ICOLCAP → núcleo IBR / liquidez",
    actual: "—",
    propuesto: "+5% rotación parcial",
    notaEstrategica: "Tomar ganancias tácticas hacia vista / corto IBR",
  },
  {
    item: "Duración RF global USD",
    actual: "Media ~4,2 a",
    propuesto: "Acortar a bucket T-Bills / <2Y",
    notaEstrategica: "Mitigar ciclo Fed alta (skill Estratega)",
  },
  {
    item: "Exposición USD agregada",
    actual: "23%",
    propuesto: "20–23%",
    notaEstrategica: "Mantener dentro banda 15–35% IPS",
  },
  {
    item: "Liquidez mínima (15%)",
    actual: "16%",
    propuesto: "≥15%",
    notaEstrategica: "Sin cambio material; vigilar rescates por fortaleza COP",
  },
];

/** Respuestas guionadas para el bloque de simulación (plantilla). */
export const CLIENT_QA_SCRIPT = [
  {
    preguntaCliente:
      "¿Por qué mi parte global viene tan presionada si el peso se fortaleció?",
    respuestaAsesor:
      "Por el doble efecto TRM + tasas US: ACWI COP en COP pierde cuando el peso sube frente al USD y, además, los bonos globales sufren con yields altos. En tu IPS la RF global es cobertura y diversificación, no apuesta direccional — por eso la propuesta es acortar duración y revisar cobertura, no salir en pánico.",
  },
  {
    preguntaCliente:
      "¿Tiene sentido tomar utilidades en Colombia después del rally?",
    respuestaAsesor:
      "Sí, de forma táctica: ICOLCAP viene muy por encima del benchmark y concentró alpha YTD. Tomar ~5% del total hacia IBR/vista financia el rebalanceo sin romper tu techo del 25% en RV ni la banda de USD.",
  },
] as const;
