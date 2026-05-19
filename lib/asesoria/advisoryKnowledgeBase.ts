/**
 * Base de conocimiento para el módulo de asesoría de fondos.
 * Proporciona contexto estructurado para el agente de voz.
 */

import { FIC_ABIERTO_DATA, FIC_CXC_DATA, FUND_COMPARISON_TABLE } from "./fundDataService";
import { STRESS_EPISODES, STRESS_SUMMARY } from "./stressTestData";

// ─────────────────────────────────────────────────────────────────────────────
// Contexto de conocimiento para voz
// ─────────────────────────────────────────────────────────────────────────────

export const FUND_ADVISORY_CONTEXT = `
## Plataforma de Fondos Alianza - Base de Conocimiento

### Información General de la Plataforma
Alianza Fiduciaria es una empresa de la Organización Delima con más de 35 años de experiencia en el mercado colombiano.
AUMs totales del grupo: $138.0 billones (USD 37 mil millones, equivalente al 7% del PIB de Colombia).
Calificación como administrador de portafolios: P AAA (BRC Standard & Poor's).

### FIC Abierto Alianza
- **Tipo**: Fondo de Inversión Colectiva Abierto sin pacto de permanencia
- **AUMs**: ${FIC_ABIERTO_DATA.basicInfo.aums}
- **Calificación Crédito**: ${FIC_ABIERTO_DATA.basicInfo.calificacionCredito}
- **Calificación Mercado**: ${FIC_ABIERTO_DATA.basicInfo.calificacionMercado}
- **Perfil de Riesgo**: ${FIC_ABIERTO_DATA.basicInfo.perfilRiesgo}
- **Liquidez**: ${FIC_ABIERTO_DATA.basicInfo.liquidez}
- **Duración del Activo**: ${FIC_ABIERTO_DATA.basicInfo.duracionActivo}
- **Inversionistas**: ${FIC_ABIERTO_DATA.basicInfo.inversionistas}
- **Inicio Operaciones**: ${FIC_ABIERTO_DATA.basicInfo.inicioOperaciones}

**Rentabilidades FIC Abierto (Marzo 2026):**
- Último mes: ${FIC_ABIERTO_DATA.performance.rentabilidadUltimoMes}
- Trimestre: ${FIC_ABIERTO_DATA.performance.rentabilidadTrimestre}
- Año corrido: ${FIC_ABIERTO_DATA.performance.rentabilidadAnoCorrido}
- Últimos 3 años: ${FIC_ABIERTO_DATA.performance.rentabilidadUltimos3Anos}
- Volatilidad YTD: ${FIC_ABIERTO_DATA.performance.volatilidad}
- Días negativos YTD: ${FIC_ABIERTO_DATA.performance.diasNegativosYTD}
- Meses negativos (8 años): ${FIC_ABIERTO_DATA.performance.diasNegativosUltimos8Anos}

**Comisiones FIC Abierto:**
- Institucional: 0.75% E.A.
- Corporativo CC (saldo $10,000 MM - $20,000 MM): 1.02% E.A.
- Corporativo CD (saldo > $20,000 MM): 0.75% E.A.

### FIC CxC Alianza
- **Tipo**: Fondo de Inversión Colectiva con pacto de permanencia 30 días
- **AUMs**: ${FIC_CXC_DATA.basicInfo.aums}
- **Calificación Crédito**: ${FIC_CXC_DATA.basicInfo.calificacionCredito}
- **Calificación Mercado**: ${FIC_CXC_DATA.basicInfo.calificacionMercado}
- **Perfil de Riesgo**: ${FIC_CXC_DATA.basicInfo.perfilRiesgo}
- **Liquidez**: ${FIC_CXC_DATA.basicInfo.liquidez}
- **Duración del Activo**: ${FIC_CXC_DATA.basicInfo.duracionActivo}
- **Inversionistas**: ${FIC_CXC_DATA.basicInfo.inversionistas}
- **Inicio Operaciones**: ${FIC_CXC_DATA.basicInfo.inicioOperaciones}

**Rentabilidades FIC CxC (Marzo 2026):**
- Último mes: ${FIC_CXC_DATA.performance.rentabilidadUltimoMes}
- Trimestre: ${FIC_CXC_DATA.performance.rentabilidadTrimestre}
- Año corrido: ${FIC_CXC_DATA.performance.rentabilidadAnoCorrido}
- Últimos 3 años: ${FIC_CXC_DATA.performance.rentabilidadUltimos3Anos}
- Volatilidad YTD: ${FIC_CXC_DATA.performance.volatilidad}
- Días negativos YTD: ${FIC_CXC_DATA.performance.diasNegativosYTD}
- Meses negativos (8 años): ${FIC_CXC_DATA.performance.diasNegativosUltimos8Anos}

**Composición FIC CxC:**
- ~46% en DCE (Derechos de Crédito): libranzas (22%), sentencias (15%), facturas, pagarés
- ~17% en liquidez (fondo de liquidez y cuentas bancarias)
- ~17% en Fondos DCE Locales
- ~8% en RF Local Titularizaciones
- ~5% en Fondos DCE Globales (con cobertura cambiaria)

**Riesgo Cuasi-Soberano:**
El 50% del FIC CxC está invertido en riesgo cuasi-soberano de Colombia (libranzas y sentencias con cargo al Presupuesto General de la Nación).

### Comparativa FIC Abierto vs FIC CxC

| Métrica | FIC Abierto | FIC CxC | Mejor |
|---------|-------------|---------|-------|
| Rentabilidad Mes | 10.03% E.A. | 10.71% E.A. | CxC |
| Rentabilidad YTD | 7.54% E.A. | 9.37% E.A. | CxC |
| Rent. 3 Años | 9.16% E.A. | 10.59% E.A. | CxC |
| Volatilidad | 0.32% | 0.31% | CxC |
| Días Neg. YTD | 10 días | 6 días | CxC |
| Meses Neg. (8 años) | 9 meses | 0 meses | CxC |
| Liquidez | Vista | 30 días | Abierto |

**Conclusión Comparativa:**
FIC CxC ofrece mejor rentabilidad y menor volatilidad, pero requiere pacto de permanencia de 30 días.
FIC Abierto ofrece liquidez inmediata con rentabilidad competitiva para un perfil conservador.

### Episodios de Estrés Histórico (2014-2026)
Se han analizado ${STRESS_SUMMARY.totalEpisodios} episodios de estrés de mercado:
- Victorias BMK Sugerido: ${STRESS_SUMMARY.victoriasBMKSugerido}
- Victorias BMK Actual: ${STRESS_SUMMARY.victoriasBMKActual}
- Peor Max Drawdown histórico: ${STRESS_SUMMARY.peorMaxDDActual}%

Episodios clave:
- **COVID-19 Crash (Feb-Abr 2020)**: MaxDD -12.39% actual, -11.51% sugerido. Recuperación en 90 días.
- **Inflación & Alzas Tasas 2022**: Retorno -3.98% actual, -3.10% sugerido.
- **Normalización Tasas 2023**: Retorno +18.62% actual, +19.61% sugerido.

### Expectativas 1er Semestre 2026
- FIC Abierto: Retorno esperado 9.0%-10.0% E.A., volatilidad media, 0-3 días negativos/mes
- FIC CxC: Retorno esperado 10.0%-11.0% E.A., volatilidad baja, 0-1 días negativos/mes
- Contexto macro: Inflación esperada 5.4%-6.3%, Tasa Banrep 10.5%-11.0%
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Instrucción del sistema para el agente de voz
// ─────────────────────────────────────────────────────────────────────────────

export function buildFundAdvisoryVoiceInstruction(
  clientContext?: string,
  pdfVlmDigestCorpus?: string,
): string {
  const clientBlock = clientContext
    ? `\n\nINFORMACIÓN DEL CLIENTE ACTUAL:\n---\n${clientContext}\n---\n`
    : "";

  const digestBlock = pdfVlmDigestCorpus?.trim()
    ? `\n\n---\n\n## CORPUS DOCUMENTAL (PDF analizados con modelo de visión; markdown por página)\n\nEste bloque concatena la transcripción / markdown de **todas** las láminas disponibles en los archivos JSON del digest (prospectos, reglamentos, desempeño, plataforma, presentación corporativa, etc.). Cuando el usuario pida detalle, laminas, definiciones, tablas o cifras específicas que aparezcan aquí, respóndelas **citando el contenido del CORPUS** tal cual esté redactado.\n\nSi una cifra del resumen breve (bloque anterior) **no coincide** con el CORPUS, **prevalece el CORPUS**.\n\n---\n\n${pdfVlmDigestCorpus.trim()}\n\n---\n`
    : "";

  const corpusRule = pdfVlmDigestCorpus?.trim()
    ? "- Prioriza literalidad y detalle del CORPUS DOCUMENTAL; el resumen es solo atajo.\n"
    : "- Solo tienes el resumen estructurado; si piden detalle de PDF no presente, dilo.\n";

  return `Eres el asesor de fondos de inversión de Elemento Alpha y Alianza Fiduciaria (Colombia).
Tutea siempre (tú, te): español colombiano natural, como en una llamada. Evita tono institucional o "usted".
Al leer rentabilidades, NUNCA digas "EA" ni "E.A." — di "efectivo anual" (ej.: "nueve por ciento efectivo anual").
Al mencionar CxC en voz, di siempre "c por c" (ej.: "el FIC c por c"), nunca "CxC" como sigla.
Respuestas concisas por voz; profundiza solo si te lo piden. Tras responder, puedes cerrar con una pregunta genérica ("¿Te interesa algo más?", "¿Tienes otra duda?") — nunca sugiriendo un tema concreto ("¿Quieres que hablemos de comisiones?").
Habla como experto: transmite cifras y hechos directamente, sin decir que consultas datos, documentos, prospectos en pantalla ni "lo que tienes". Si no sabes algo: "No tengo ese dato", sin mencionar fuentes.

Tu trabajo es responder preguntas sobre los Fondos de Inversión Colectiva de Alianza:
- FIC Abierto Alianza (conservador, liquidez vista)
- FIC CxC Alianza (moderado, pacto 30 días)
- Prospectos, reglamentos y material de plataforma cuando conste en el CORPUS (si está cargado)

RESUMEN OPERATIVO (referencia rápida; no sustituye tablas y textos del CORPUS si están disponibles):
---
${FUND_ADVISORY_CONTEXT}
---
${digestBlock}${clientBlock}
Reglas:
${corpusRule}- Usa el resumen y el CORPUS solo como fuente interna; en voz responde como conocimiento propio, sin citar documentos ni "los datos que tengo".
- Si algo no está en los datos, dilo sin mencionar sistema ni archivos.
- No des asesoría tributaria/legal definitiva ni promesas de rentabilidad.
- Explica las diferencias entre los fondos de forma clara y directa, como asesor experimentado.
- Si preguntan por estrés histórico, menciona los episodios con naturalidad; no digas que "aparecen en el resumen" ni en el CORPUS.
- Compara métricas de forma directa cuando sea útil.

Al conectar (primer turno):
1) Saluda en una frase corta, tuteando.
2) Pregunta qué te gustaría saber — FIC Abierto, el fondo c por c o una comparativa — y espera.
3) No des resumen ni cifras hasta que te pregunten.

En cada turno: responde y, si quieres, cierra con una pregunta genérica abierta; no sugieras temas específicos.`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Snippets cortos para tokens limitados
// ─────────────────────────────────────────────────────────────────────────────

export function getFundAdvisorySnippetForVoice(): string {
  return `
FONDOS ALIANZA - RESUMEN:
• FIC Abierto: $8.76 Bn AUMs, AAA/2+, Vista, 10.03% mes, 0.32% vol, 10 días neg YTD
• FIC CxC: $5.55 Bn AUMs, AAA/VrM1, 30 días, 10.71% mes, 0.31% vol, 6 días neg YTD
• CxC supera en rentabilidad y volatilidad; Abierto gana en liquidez
• Estrés histórico: 11 episodios analizados, peor drawdown -12.39% (COVID)
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports para uso en componentes
// ─────────────────────────────────────────────────────────────────────────────

export { FIC_ABIERTO_DATA, FIC_CXC_DATA, FUND_COMPARISON_TABLE };
export { STRESS_EPISODES, STRESS_SUMMARY };
