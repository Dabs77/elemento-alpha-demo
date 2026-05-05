import {
  ACTIVE_ALERTS,
  COMPARISON_VS_BENCHMARK,
  DISTRIBUTION_BY_ASSET_TYPE,
  DISTRIBUTION_BY_CURRENCY,
  HNW_CLIENT_DEMO,
} from "@/lib/servicio-cliente/hnwAlejandroReport";
import { getKnowledgeSnippetForVoice } from "@/lib/servicio-cliente/knowledgeBase";

/** Referencia FO demo (sin forzar benchmark cliente). */
const FO_FOOTNOTE =
  "Nota FO proyecto (solo referencia interna demo): datasets ultralíquido en /portfolio no sustituyen el benchmark compuesto IBR/COLTES/ICOLCAP+ACWI del IPS cliente.";

/**
 * Contexto autorizado para Gemini Live · modo customer_support · persona natural HNW.
 */
export function buildCustomerSupportContextFromHnw(): string {
  const alertsLines = ACTIVE_ALERTS.map(
    (a) => `- [${a.status === "ok" ? "OK" : "⚠"}] ${a.alerta} → ${a.accionSugerida}`
  ).join("\n");

  const cmpLines = COMPARISON_VS_BENCHMARK.map(
    (r) => `- ${r.metric}: Portafolio ${r.portfolio} · Benchmark ${r.benchmark} · Alpha ${r.alpha}`
  ).join("\n");

  const kb = getKnowledgeSnippetForVoice();

  return `
Cliente / expediente: ${HNW_CLIENT_DEMO.expedienteId}
Nombre: ${HNW_CLIENT_DEMO.nombre}
Segmento: ${HNW_CLIENT_DEMO.tipoCliente}
Horizonte: ${HNW_CLIENT_DEMO.horizonte} · Perfil: ${HNW_CLIENT_DEMO.perfilRiesgo}
Patrimonio estimado (demo): ${HNW_CLIENT_DEMO.patrimonioTotal}
Periodo informe: ${HNW_CLIENT_DEMO.fechaElaboracion} · Próxima revisión: ${HNW_CLIENT_DEMO.proximaRevision}

Distribución sintética (brief demo):
- Por moneda: ${DISTRIBUTION_BY_CURRENCY}
- Por tipo de activo: ${DISTRIBUTION_BY_ASSET_TYPE}

Comparación vs benchmark compuesto (Q1 2026 demo):
${cmpLines}

Alertas activas (resumen):
${alertsLines}

IPS / política y restricciones (fragmento autorizado — no contradecir):
---
${kb}
---

${FO_FOOTNOTE}

Política de comunicación demo: sin órdenes de mercado ni ejecutar traslados; solo orientación, síntesis y escalamiento cuando aplique.
`.trim();
}
