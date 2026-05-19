import type { SimulatedClientPosition } from "./simulatedClientData";
import { formatCOP } from "./simulatedClientData";

export type RecommendationRuleId =
  | "traslado_total_cxc_6_12"
  | "traslado_total_cxc_aumento_20"
  | "mantener_abierto_abrir_cxc_20";

export type ClientRecommendationRule = {
  id: RecommendationRuleId;
  titulo: string;
  sugerencia: string;
  condicion: string;
  aplica: boolean;
  /** Monto mínimo de aumento o apertura en CxC (20% posición) */
  valorAumento?: number;
  valorAumentoLabel?: string;
  montoTraslado?: number;
};

const AUMENTO_PCT = 0.2;

function buildRuleDefinitions(client: SimulatedClientPosition): ClientRecommendationRule[] {
  const { tiempoPermanenciaMeses, posicionActual } = client;
  const retirosCapitalPct = client.retirosCapitalPct ?? 0;
  const valorAumento = Math.round(posicionActual * AUMENTO_PCT);
  const sinRetiros = retirosCapitalPct === 0;

  const rule1Applies =
    tiempoPermanenciaMeses > 6 &&
    tiempoPermanenciaMeses < 12 &&
    sinRetiros;

  const rule2Applies =
    tiempoPermanenciaMeses > 12 && retirosCapitalPct < 30;

  const rule3Applies =
    tiempoPermanenciaMeses > 12 &&
    retirosCapitalPct >= 30 &&
    retirosCapitalPct < 50;

  return [
    {
      id: "traslado_total_cxc_6_12",
      titulo: "Traslado total a FIC CxC",
      sugerencia: `Ofrecer traslado del saldo total (${formatCOP(posicionActual)}) de FIC Abierto a FIC CxC Alianza.`,
      condicion:
        "Permanencia mayor a 6 meses y menor a 12 meses, sin retiros de capital en el periodo.",
      aplica: rule1Applies,
      montoTraslado: posicionActual,
    },
    {
      id: "traslado_total_cxc_aumento_20",
      titulo: "Traslado total a CxC + aumento de posición",
      sugerencia: `Ofrecer traslado del saldo total (${formatCOP(posicionActual)}) a FIC CxC, más un aumento de al menos 20% sobre la posición actual.`,
      condicion:
        "Permanencia mayor a 12 meses, con retiros de capital menores al 30% del capital.",
      aplica: rule2Applies,
      montoTraslado: posicionActual,
      valorAumento,
      valorAumentoLabel: `Capital de aumento mínimo: ${formatCOP(valorAumento)}`,
    },
    {
      id: "mantener_abierto_abrir_cxc_20",
      titulo: "Mantener FIC Abierto + abrir FIC CxC",
      sugerencia:
        "Ofrecer mantener el saldo en FIC Abierto y abrir FIC CxC Alianza con un monto equivalente al menos al 20% de la posición actual.",
      condicion:
        "Permanencia mayor a 12 meses, con retiros de capital menores al 50% del capital.",
      aplica: rule3Applies,
      valorAumento,
      valorAumentoLabel: `Capital mínimo en CxC: ${formatCOP(valorAumento)}`,
    },
  ];
}

export function evaluateClientRecommendations(client: SimulatedClientPosition): {
  active: ClientRecommendationRule | null;
  all: ClientRecommendationRule[];
} {
  const all = buildRuleDefinitions(client);
  const active = all.find((r) => r.aplica) ?? null;
  return { active, all };
}

export function formatRetirosPct(pct?: number | null): string {
  const value = pct ?? 0;
  if (value === 0) return "Sin retiros";
  return `${value.toFixed(1).replace(".0", "")}% del capital`;
}
