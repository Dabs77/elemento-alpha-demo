/**
 * Propuesta formal de rebalanceo Q2 2026 · demo servicio al cliente (HNW Acropolis Labs SAS).
 * Una sola opción; texto alineado al informe narrativo del usuario.
 */

export const HNW_REBALANCE_Q2_TITLE =
  "5. Propuesta Formal de Rebalanceo — Q2 2026";

export const HNW_REBALANCE_Q2_INTRO =
  "Esta propuesta fue generada con base en los hallazgos de la reunión periódica Q1 2026, las alertas activas del portafolio y el contexto de mercado vigente al 1 de abril de 2026.";

export const HNW_REBALANCE_Q2_JUSTIFICATION_TITLE = "5.1 Justificación del Rebalanceo";

export const HNW_REBALANCE_Q2_JUSTIFICATION_LEAD =
  "Tres factores fundamentan los ajustes propuestos:";

export const HNW_REBALANCE_Q2_JUSTIFICATION_BULLETS: string[] = [
  "Ciclo bajista de Banrep: la tasa rectora bajó de 10,75% a 9,25% en Q1 y se proyectan 2–3 recortes adicionales en 2026. Esto favorece la renta fija de tasa fija de mediana duración sobre los instrumentos de tasa variable corta.",
  "Riesgo cambiario elevado: el COP está sobrevaluado y la posición global en USD sufre doble efecto (mercado + tipo de cambio). La cobertura parcial es necesaria.",
  "Toma de utilidades en renta variable local: el ICOLCAP ha tenido un rally extraordinario (+38% en 1 año) que no puede extrapolarse sin corrección técnica.",
];

export type HnwRebalanceComparisonRow = {
  activo: string;
  pesoActual: string;
  montoActual: string;
  pesoPropuesto: string;
  montoPropuesto: string;
  movimiento: string;
};

export const HNW_REBALANCE_Q2_COMPARISON_TABLE: HnwRebalanceComparisonRow[] = [
  {
    activo: "IBR 12M Corporativo",
    pesoActual: "25%",
    montoActual: "$300M",
    pesoPropuesto: "32%",
    montoPropuesto: "$384M",
    movimiento: "↑ +$84M (toma utilidades ICOLCAP + retorno desde LEGATRUU)",
  },
  {
    activo: "COLTES Corto Plazo",
    pesoActual: "20%",
    montoActual: "$240M",
    pesoPropuesto: "18%",
    montoPropuesto: "$216M",
    movimiento: "↓ -$24M (rotación hacia COLTES LP ante ciclo bajista)",
  },
  {
    activo: "COLTES Largo Plazo",
    pesoActual: "15%",
    montoActual: "$180M",
    pesoPropuesto: "18%",
    montoPropuesto: "$216M",
    movimiento: "↑ +$36M (ciclo bajista Banrep favorece duración)",
  },
  {
    activo: "Renta Variable Colombia (ICOLCAP)",
    pesoActual: "12%",
    montoActual: "$144M",
    pesoPropuesto: "8%",
    montoPropuesto: "$96M",
    movimiento: "↓ -$48M (toma de utilidades post-rally +38%)",
  },
  {
    activo: "Renta Variable Global (ACWI COP)",
    pesoActual: "13%",
    montoActual: "$156M",
    pesoPropuesto: "13%",
    montoPropuesto: "$156M",
    movimiento: "→ Mantener. Implementar cobertura cambiaria 60% de la posición",
  },
  {
    activo: "Renta Fija Global (LEGATRUU USD)",
    pesoActual: "10%",
    montoActual: "$120M",
    pesoPropuesto: "6%",
    montoPropuesto: "$72M",
    movimiento: "↓ -$48M → rotación a T-Bills USD (duration corta, 4,2%)",
  },
  {
    activo: "T-Bills USD (NUEVO)",
    pesoActual: "0%",
    montoActual: "$0",
    pesoPropuesto: "5%",
    montoPropuesto: "$60M",
    movimiento: "↑ NUEVO: RF USD de duración <1 año. Yield: 4,2%",
  },
  {
    activo: "Finca Raíz Colombia",
    pesoActual: "5%",
    montoActual: "$60M",
    pesoPropuesto: "5%",
    montoPropuesto: "$60M",
    movimiento: "→ Sin cambio",
  },
  {
    activo: "Liquidez (Caja transitoria)",
    pesoActual: "0%",
    montoActual: "$0",
    pesoPropuesto: "—%",
    montoPropuesto: "~$0",
    movimiento: "Ajuste post-rebalanceo. Los flujos se reinvierten en IBR corto.",
  },
];

export const HNW_REBALANCE_Q2_COMPARISON_TOTAL = {
  pesoActual: "100%",
  montoActual: "$1.200M",
  pesoPropuesto: "100%",
  montoPropuesto: "$1.200M",
  nota: "Cero movimiento de caja neto. Rebalanceo interno.",
};

/** Pesos numéricos para gráficos (sin liquidez transitoria). Orden alineado a la tabla 5.2. */
export type HnwRebalanceAllocationChartRow = {
  key: string;
  labelShort: string;
  actualPct: number;
  proposedPct: number;
};

export const HNW_REBALANCE_Q2_ALLOCATION_CHART: HnwRebalanceAllocationChartRow[] = [
  { key: "ibr", labelShort: "IBR 12M", actualPct: 25, proposedPct: 32 },
  { key: "coltes_cp", labelShort: "COLTES CP", actualPct: 20, proposedPct: 18 },
  { key: "coltes_lp", labelShort: "COLTES LP", actualPct: 15, proposedPct: 18 },
  { key: "rv_co", labelShort: "RV ICOLCAP", actualPct: 12, proposedPct: 8 },
  { key: "rv_gl", labelShort: "RV ACWI", actualPct: 13, proposedPct: 13 },
  { key: "rf_usd_agg", labelShort: "LEGATRUU", actualPct: 10, proposedPct: 6 },
  { key: "tbills", labelShort: "T-Bills USD", actualPct: 0, proposedPct: 5 },
  { key: "finca", labelShort: "Finca raíz", actualPct: 5, proposedPct: 5 },
];

export type HnwRebalanceMetricRow = {
  metrica: string;
  actual: string;
  propuesto: string;
  cambio: string;
};

export const HNW_REBALANCE_Q2_IMPACT_METRICS: HnwRebalanceMetricRow[] = [
  {
    metrica: "Retorno esperado anual (COP)",
    actual: "9,5 – 11,0%",
    propuesto: "10,0 – 12,0%",
    cambio: "+0,5 – 1,0%",
  },
  {
    metrica: "Volatilidad estimada anualizada",
    actual: "4,8%",
    propuesto: "3,9%",
    cambio: "-0,9%",
  },
  {
    metrica: "Duración modificada (años)",
    actual: "1,8 años",
    propuesto: "1,4 años",
    cambio: "-0,4 años",
  },
  {
    metrica: "Exposición USD (sin cobertura)",
    actual: "23%",
    propuesto: "8% neto*",
    cambio: "-15% riesgo FX",
  },
  {
    metrica: "Sharpe Ratio estimado",
    actual: "1,42",
    propuesto: "1,68",
    cambio: "+0,26",
  },
  {
    metrica: "Max Drawdown esperado",
    actual: "-5,8%",
    propuesto: "-4,2%",
    cambio: "-1,6%",
  },
];

/** Valores numéricos para barras (retorno = punto medio del rango). Sin exposición USD (mixta actual/neto). */
export type HnwRebalanceImpactNumericRow = {
  key: string;
  chartLabel: string;
  unit: string;
  actual: number;
  proposed: number;
};

export const HNW_REBALANCE_Q2_IMPACT_NUMERIC: HnwRebalanceImpactNumericRow[] = [
  {
    key: "retorno",
    chartLabel: "Retorno esp. (pt. medio)",
    unit: "%",
    actual: 10.25,
    proposed: 11,
  },
  { key: "vol", chartLabel: "Volatilidad anual.", unit: "%", actual: 4.8, proposed: 3.9 },
  { key: "duracion", chartLabel: "Duración (años)", unit: "a", actual: 1.8, proposed: 1.4 },
  { key: "sharpe", chartLabel: "Sharpe est.", unit: "", actual: 1.42, proposed: 1.68 },
  { key: "mdd", chartLabel: "Max drawdown", unit: "%", actual: -5.8, proposed: -4.2 },
];

export const HNW_REBALANCE_Q2_USD_FOOTNOTE =
  "*La exposición USD bruta se mantiene en 24% (ACWI 13% + T-Bills 5% + LEGATRUU 6%), pero con cobertura forward al 60% de la posición ACWI, la exposición neta efectiva al riesgo cambiario se reduce al ~8%.";

export type HnwRebalanceCostRow = {
  operacion: string;
  monto: string;
  costoEst: string;
  impactoPct: string;
};

export const HNW_REBALANCE_Q2_COSTS: HnwRebalanceCostRow[] = [
  {
    operacion: "Venta ICOLCAP (toma utilidades)",
    monto: "$48.000.000 COP",
    costoEst: "$144.000",
    impactoPct: "0,30%",
  },
  {
    operacion: "Compra IBR 12M (entrada a fondo)",
    monto: "$84.000.000 COP",
    costoEst: "$0",
    impactoPct: "0,00%",
  },
  {
    operacion: "Rotación COLTES CP a COLTES LP",
    monto: "$24.000.000 COP",
    costoEst: "$12.000",
    impactoPct: "0,05%",
  },
  {
    operacion: "Venta LEGATRUU / Compra T-Bills",
    monto: "$48.000.000 COP (~USD 13.070)",
    costoEst: "$72.000",
    impactoPct: "0,15%",
  },
  {
    operacion: "Forward USD/COP (cobertura 60% ACWI)",
    monto: "USD 25.500 (~$93.665.100 COP)",
    costoEst: "$140.500",
    impactoPct: "0,15%",
  },
];

export const HNW_REBALANCE_Q2_COSTS_TOTAL_ROW: HnwRebalanceCostRow = {
  operacion: "TOTAL COSTOS ESTIMADOS",
  monto: "—",
  costoEst: "$368.500 COP",
  impactoPct: "0,031%",
};

export const HNW_REBALANCE_Q2_COSTS_TOTAL =
  "Los costos de transacción representan el 0,031% del portafolio total — un nivel insignificante frente al impacto esperado positivo de +50–100bps en retorno ajustado por riesgo.";

export type HnwRebalanceScheduleRow = {
  dia: string;
  accion: string;
  responsable: string;
};

export const HNW_REBALANCE_Q2_SCHEDULE: HnwRebalanceScheduleRow[] = [
  {
    dia: "D+1 (7 abr)",
    accion: "Aprobación del cliente y firma de instrucciones de inversión",
    responsable: "Cliente + Asesor",
  },
  {
    dia: "D+2 (8 abr)",
    accion: "Venta ICOLCAP y LEGATRUU. Liquidación T+2.",
    responsable: "Mesa de dinero EA",
  },
  {
    dia: "D+3 (9 abr)",
    accion: "Rotación COLTES CP → LP. Compra T-Bills USD.",
    responsable: "Mesa de dinero EA",
  },
  {
    dia: "D+4 (10 abr)",
    accion: "Implementación forward USD/COP. Reinversión en IBR 12M.",
    responsable: "Tesorería + Asesor",
  },
  {
    dia: "D+5 (11 abr)",
    accion: "Confirmación de operaciones y envío de estado de cuenta actualizado",
    responsable: "Back-office EA",
  },
];

/** Contexto de voz para `useVoiceAgent` modo rebalance_advisor. */
export function buildHnwRebalanceQ2VoiceContext(): string {
  const lines: string[] = [
    "PROPUESTA ÚNICA DE REBALANCEO — Q2 2026 (demo Elemento Alpha · cliente PJ Acropolis Labs SAS)",
    "",
    HNW_REBALANCE_Q2_INTRO,
    "",
    HNW_REBALANCE_Q2_JUSTIFICATION_LEAD,
    ...HNW_REBALANCE_Q2_JUSTIFICATION_BULLETS.map((b) => `• ${b}`),
    "",
    "TABLA — Portafolio actual vs propuesto (pesos y montos ejemplo sobre base $1.200M):",
    ...HNW_REBALANCE_Q2_COMPARISON_TABLE.map(
      (r) =>
        `- ${r.activo}: actual ${r.pesoActual} (${r.montoActual}) → propuesto ${r.pesoPropuesto} (${r.montoPropuesto}). ${r.movimiento}`
    ),
    `- TOTAL: ${HNW_REBALANCE_Q2_COMPARISON_TOTAL.nota}`,
    "",
    "IMPACTO esperado en riesgo y rentabilidad:",
    ...HNW_REBALANCE_Q2_IMPACT_METRICS.map((r) => `- ${r.metrica}: actual ${r.actual} → propuesto ${r.propuesto} (${r.cambio})`),
    "",
    HNW_REBALANCE_Q2_USD_FOOTNOTE,
    "",
    "COSTOS de transacción estimados:",
    ...HNW_REBALANCE_Q2_COSTS.map((r) => `- ${r.operacion}: ${r.monto} · costo ${r.costoEst} · impacto ${r.impactoPct}`),
    `- ${HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.operacion}: ${HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.costoEst} (${HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.impactoPct} del portafolio)`,
    "",
    HNW_REBALANCE_Q2_COSTS_TOTAL,
    "",
    "CRONOGRAMA:",
    ...HNW_REBALANCE_Q2_SCHEDULE.map((r) => `- ${r.dia}: ${r.accion} · ${r.responsable}`),
  ];
  return lines.join("\n");
}
