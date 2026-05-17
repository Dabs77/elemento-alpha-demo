/**
 * Motor de señales y alertas simuladas para el módulo de asesoría.
 * Genera alertas basadas en umbrales de métricas de los fondos.
 */

export type AlertSeverity = "info" | "success" | "warning" | "danger";
export type AlertCategory = "volatilidad" | "rentabilidad" | "drawdown" | "dias_negativos" | "benchmark" | "general";

export interface Alert {
  id: string;
  titulo: string;
  descripcion: string;
  severity: AlertSeverity;
  categoria: AlertCategory;
  fondo?: "FIC Abierto" | "FIC CxC" | "ambos";
  valor?: string;
  umbral?: string;
  timestamp: string;
}

// Umbrales configurables
export const ALERT_THRESHOLDS = {
  volatilidad: {
    warning: 0.5, // 0.5%
    danger: 1.0,  // 1.0%
  },
  diasNegativosMes: {
    warning: 5,
    danger: 10,
  },
  maxDrawdown: {
    warning: -5,  // -5%
    danger: -10,  // -10%
  },
  desviacionBenchmark: {
    warning: 0.5, // 50 bps
    danger: 1.0,  // 100 bps
  },
};

// Datos actuales de los fondos (simulados)
interface FundCurrentMetrics {
  volatilidad: number;
  diasNegativosMes: number;
  maxDrawdownYTD: number;
  rentabilidadVsBenchmark: number;
  rentabilidadMes: number;
  diasSinNegativo: number;
}

const FIC_ABIERTO_METRICS: FundCurrentMetrics = {
  volatilidad: 0.32,
  diasNegativosMes: 3,
  maxDrawdownYTD: -16.89,
  rentabilidadVsBenchmark: 0.35, // 35 bps sobre benchmark
  rentabilidadMes: 10.03,
  diasSinNegativo: 5,
};

const FIC_CXC_METRICS: FundCurrentMetrics = {
  volatilidad: 0.31,
  diasNegativosMes: 2,
  maxDrawdownYTD: -17.03,
  rentabilidadVsBenchmark: 0.82, // 82 bps sobre benchmark
  rentabilidadMes: 10.71,
  diasSinNegativo: 8,
};

// Genera alertas para un fondo específico
function generateFundAlerts(
  fondo: "FIC Abierto" | "FIC CxC",
  metrics: FundCurrentMetrics
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // Alerta de volatilidad
  if (metrics.volatilidad >= ALERT_THRESHOLDS.volatilidad.danger) {
    alerts.push({
      id: `${fondo}-vol-danger`,
      titulo: "Volatilidad Elevada",
      descripcion: `La volatilidad del ${fondo} (${metrics.volatilidad}%) supera el umbral de alerta (${ALERT_THRESHOLDS.volatilidad.danger}%).`,
      severity: "danger",
      categoria: "volatilidad",
      fondo,
      valor: `${metrics.volatilidad}%`,
      umbral: `${ALERT_THRESHOLDS.volatilidad.danger}%`,
      timestamp: now,
    });
  } else if (metrics.volatilidad >= ALERT_THRESHOLDS.volatilidad.warning) {
    alerts.push({
      id: `${fondo}-vol-warning`,
      titulo: "Volatilidad Moderada",
      descripcion: `La volatilidad del ${fondo} (${metrics.volatilidad}%) está en zona de precaución.`,
      severity: "warning",
      categoria: "volatilidad",
      fondo,
      valor: `${metrics.volatilidad}%`,
      umbral: `${ALERT_THRESHOLDS.volatilidad.warning}%`,
      timestamp: now,
    });
  }

  // Alerta de días negativos
  if (metrics.diasNegativosMes >= ALERT_THRESHOLDS.diasNegativosMes.danger) {
    alerts.push({
      id: `${fondo}-dias-danger`,
      titulo: "Días Negativos Elevados",
      descripcion: `${fondo} ha tenido ${metrics.diasNegativosMes} días negativos este mes.`,
      severity: "danger",
      categoria: "dias_negativos",
      fondo,
      valor: `${metrics.diasNegativosMes} días`,
      umbral: `${ALERT_THRESHOLDS.diasNegativosMes.danger} días`,
      timestamp: now,
    });
  } else if (metrics.diasNegativosMes >= ALERT_THRESHOLDS.diasNegativosMes.warning) {
    alerts.push({
      id: `${fondo}-dias-warning`,
      titulo: "Días Negativos en Aumento",
      descripcion: `${fondo} acumula ${metrics.diasNegativosMes} días negativos este mes.`,
      severity: "warning",
      categoria: "dias_negativos",
      fondo,
      valor: `${metrics.diasNegativosMes} días`,
      umbral: `${ALERT_THRESHOLDS.diasNegativosMes.warning} días`,
      timestamp: now,
    });
  }

  // Alerta de max drawdown
  if (metrics.maxDrawdownYTD <= ALERT_THRESHOLDS.maxDrawdown.danger) {
    alerts.push({
      id: `${fondo}-dd-danger`,
      titulo: "Drawdown Significativo",
      descripcion: `El max drawdown YTD del ${fondo} (${metrics.maxDrawdownYTD}%) es relevante.`,
      severity: "warning",
      categoria: "drawdown",
      fondo,
      valor: `${metrics.maxDrawdownYTD}%`,
      umbral: `${ALERT_THRESHOLDS.maxDrawdown.danger}%`,
      timestamp: now,
    });
  }

  // Alertas positivas
  if (metrics.rentabilidadVsBenchmark > 0) {
    alerts.push({
      id: `${fondo}-benchmark-positive`,
      titulo: "Rentabilidad Superior al Benchmark",
      descripcion: `${fondo} supera su benchmark en ${(metrics.rentabilidadVsBenchmark * 100).toFixed(0)} puntos básicos.`,
      severity: "success",
      categoria: "benchmark",
      fondo,
      valor: `+${(metrics.rentabilidadVsBenchmark * 100).toFixed(0)} bps`,
      timestamp: now,
    });
  }

  if (metrics.diasSinNegativo >= 5) {
    alerts.push({
      id: `${fondo}-dias-positivos`,
      titulo: "Racha Positiva",
      descripcion: `${fondo} lleva ${metrics.diasSinNegativo} días consecutivos sin rendimiento negativo.`,
      severity: "success",
      categoria: "dias_negativos",
      fondo,
      valor: `${metrics.diasSinNegativo} días`,
      timestamp: now,
    });
  }

  return alerts;
}

// Genera todas las alertas del sistema
export function generateAllAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // Alertas de FIC Abierto
  alerts.push(...generateFundAlerts("FIC Abierto", FIC_ABIERTO_METRICS));

  // Alertas de FIC CxC
  alerts.push(...generateFundAlerts("FIC CxC", FIC_CXC_METRICS));

  // Alertas generales / comparativas
  alerts.push({
    id: "general-cxc-mejor-mes",
    titulo: "FIC CxC Lidera Rentabilidad Mensual",
    descripcion: `FIC CxC (${FIC_CXC_METRICS.rentabilidadMes}% E.A.) supera a FIC Abierto (${FIC_ABIERTO_METRICS.rentabilidadMes}% E.A.) en rentabilidad del mes.`,
    severity: "info",
    categoria: "rentabilidad",
    fondo: "ambos",
    timestamp: now,
  });

  alerts.push({
    id: "general-mercado-estres",
    titulo: "Entorno de Estrés Moderado",
    descripcion: "El mercado de renta fija local muestra volatilidad por expectativas de tasas del Banco de la República.",
    severity: "info",
    categoria: "general",
    timestamp: now,
  });

  return alerts;
}

// Filtra alertas por severidad
export function filterAlertsBySeverity(alerts: Alert[], severity: AlertSeverity): Alert[] {
  return alerts.filter((a) => a.severity === severity);
}

// Filtra alertas por fondo
export function filterAlertsByFund(alerts: Alert[], fondo: "FIC Abierto" | "FIC CxC"): Alert[] {
  return alerts.filter((a) => a.fondo === fondo || a.fondo === "ambos" || !a.fondo);
}

// Cuenta alertas por severidad
export function countAlertsBySeverity(alerts: Alert[]): Record<AlertSeverity, number> {
  return {
    info: alerts.filter((a) => a.severity === "info").length,
    success: alerts.filter((a) => a.severity === "success").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    danger: alerts.filter((a) => a.severity === "danger").length,
  };
}
