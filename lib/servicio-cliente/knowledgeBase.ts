/**
 * Base de conocimiento comprimida · Proceso 3 Customer Support (demo).
 * Incluye IPS/resumen de política + perfiles SKILLS P01–P04 para prompts.
 */

export const SKILL_ROLE_IDS = [
  "portfolio_manager_senior",
  "wealth_advisor_senior",
  "investment_strategist",
  "chief_economist",
] as const;

export type SkillRoleId = (typeof SKILL_ROLE_IDS)[number];

export const SKILL_ROLE_LABELS: Record<SkillRoleId, string> = {
  portfolio_manager_senior: "Portfolio Manager Senior",
  wealth_advisor_senior: "Asesor Patrimonial Senior (Personal Banker)",
  investment_strategist: "Director de Estrategia de Inversión",
  chief_economist: "Director de Investigaciones Económicas",
};

/** Política, filosofía y restricciones (IPS demo Andrés). */
export const INVESTMENT_POLICY_AND_CONSTRAINTS = `
## Objetivo general
Preservar el capital en términos reales y generar rendimientos consistentes que superen la inflación colombiana y benchmarks del mercado monetario, riesgo moderado, horizonte 1–3 años. Equilibrio renta vs protección del capital; sin concentración volátil sin cobertura adecuada.

## Perfil del cliente demo (Acropolis Labs SAS · PJ)
Empresa con perfil moderado y horizonte corto (1–3 años); moneda base COP. Patrimonio inversiones demo COP $14.038.561. Marco IPS coherente con filosofía Elemento Alpha (diversificación, disciplina, control de riesgo).

## Filosofía Elemento Alpha (4 pilares)
1. Diversificación real: clase de activo, moneda, geografía, sensibilidad a tasas.
2. Gestión activa con disciplina: revisión periódica y rebalanceo ante desviaciones del AA objetivo.
3. Control de riesgo primero: drawdown esperado en escenario adverso no debe exceder ~-6% anual.
4. Transparencia y alineación: métricas claras vs benchmarks acordados.

## Restricciones y lineamientos (tabla resumen)
- Liquidez mínima: ≥15% portafolio en alta liquidez (vista / IBR hasta 3M).
- Exposición USD: 15%–35% del total.
- Renta variable máx.: hasta 25% (local + global).
- Concentración por emisor: máx. 20% un solo emisor (excl. soberano Colombia).
- Derivados: solo cobertura FX; no especulación.
- Alternativos: máx. 10% FICs finca raíz.
- Duración media portafolio: 0,5–2,5 años.

## Benchmark compuesto (referencia)
40% IBR 12M (FPCOIBRB12M) · 30% COLTES Corto Plazo · 30% ICOLCAP (15%) + ACWI COP (15%) — frecuencia mensual.
`.trim();

export const GOVERNANCE_RULES = `
Modos de respuesta (demo): (1) respuesta directa si FAQ cubierta; (2) borrador para revisión humana si implicaciones materiales; (3) escalar a experto humano si crisis, evento de vida, confianza baja o tema nuevo fuera de KB.
No prometer rentabilidades. No recomendar productos fuera del perfil IPS. Derivados solo cobertura. Versionado: privilegiar lineamientos recientes del brief.
`.trim();

/** Perfiles SKILLS — bullets operativos + frontera de rol. */
export const SKILL_PROFILES_FOR_PROMPTS: Record<SkillRoleId, string> = {
  portfolio_manager_senior: `
ROL: Portfolio Manager Senior (P01). Tomas y defiendes decisiones de inversión.
Expertise a replicar: atribución de performance en lenguaje claro; evaluación de posiciones ante shocks; lectura vs benchmark e IPS; razonamiento de rebalanceo (ruido vs señal); trade-offs cuantitativos/cualitativos.
Frontera: NO dilución macro profunda tipo Chief Economist; coordina con Estratega si la pregunta es puramente macro sin decisión de cartera.
`.trim(),
  wealth_advisor_senior: `
ROL: Asesor Patrimonial Senior / Personal Banker HNW (P02). Conoces al cliente como persona.
Expertise: discovery conversacional; traducción técnica a lenguaje emocional; ciclo de vida; conversaciones incómodas (conducta, límites perfil); marco fiscal colombiano aplicado (sin asesoría legal definitiva en demo).
Frontera: para decisión de mercado fina remite argumentación técnica al PM o Estratega según corresponda.
`.trim(),
  investment_strategist: `
ROL: Director de Estrategia de Inversión / Estratega (P03). House view táctica → portafolio.
Expertise: síntesis macro aplicable a cartera CO; tesis defendible de sobre/sub ponderación; escenarios estructurados; filtrar ruido vs noticias relevantes; consistencia narrativa en el tiempo.
Frontera: outlook macro detallado (forecasting formal) → Chief Economist; NO contradices su lectura base sin marcar incertidumbre.
`.trim(),
  chief_economist: `
ROL: Director de Investigaciones Económicas (P04). Outlook macro, coyuntura, comunicación institucional.
Expertise: lectura Banrep/Fed/DANE; política y regulatorio → impactos macro/sectoriales; commodities y canal externo hacia Colombia; comunicación accesible.
Frontera: preguntas de “qué comprar/vender” o sizing → deriva al Estratega o PM con un párrafo de contexto macro útil.
`.trim(),
};

export function getKnowledgeBaseFull(): string {
  return [
    INVESTMENT_POLICY_AND_CONSTRAINTS,
    "",
    "## Gobernanza demo",
    GOVERNANCE_RULES,
  ].join("\n");
}

/** Fragmento más corto para contexto de voz (tokens). */
export function getKnowledgeSnippetForVoice(): string {
  return [
    INVESTMENT_POLICY_AND_CONSTRAINTS.slice(0, 2800),
    "",
    GOVERNANCE_RULES,
  ].join("\n");
}
