"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import {
  SKILL_PROFILES_FOR_PROMPTS,
  SKILL_ROLE_LABELS,
  type SkillRoleId,
} from "@/lib/servicio-cliente/knowledgeBase";

type VoiceCloseReason = { code?: number; reason?: string };

type LiveVoiceSession = {
  close: () => void;
  sendClientContent: (params: {
    turns?: { role?: string; parts?: { text?: string }[] }[];
    turnComplete?: boolean;
  }) => void;
  sendRealtimeInput: (params: {
    audio?: { data: string; mimeType: string };
    text?: string;
  }) => void;
};

/** Tamaño por fragmento al inyectar corpus grande vía sendClientContent (evita error 1007). */
const FUND_ADVISORY_CONTEXT_CHUNK_SIZE = 30_000;

function chunkFundAdvisoryContext(context: string): string[] {
  if (context.length <= FUND_ADVISORY_CONTEXT_CHUNK_SIZE) return [context];
  const chunks: string[] = [];
  for (let i = 0; i < context.length; i += FUND_ADVISORY_CONTEXT_CHUNK_SIZE) {
    chunks.push(context.slice(i, i + FUND_ADVISORY_CONTEXT_CHUNK_SIZE));
  }
  return chunks;
}

/** Por encima de esto el contexto se inyecta por chunks (modo JSON completo). */
const FUND_ADVISORY_INLINE_CONTEXT_MAX = 50_000;

function formatLiveCloseError(code?: number, reason?: string): string {
  const r = (reason ?? "").toLowerCase();
  if (code === 1011 || r.includes("quota") || r.includes("billing")) {
    return (
      "Cuota de Gemini agotada. El modo JSON completo (~1,8M caracteres) consume muchísima cuota por sesión. " +
      "Opciones: (1) revisa facturación en aistudio.google.com, o (2) quita FUND_ADVISORY_VOICE_FULL_JSON=1 de .env.local " +
      "para usar el modo compacto (~40 KB) y reinicia npm run dev."
    );
  }
  if (code === 1007 || r.includes("invalid argument")) {
    return "Contexto demasiado grande para Gemini Live. Usa modo compacto (sin FUND_ADVISORY_VOICE_FULL_JSON=1).";
  }
  return `Conexión cerrada (${code ?? "?"}): ${reason || "sin razón"}`;
}

function sendFundAdvisoryContextChunks(session: LiveVoiceSession, context: string): void {
  const chunks = chunkFundAdvisoryContext(context);
  const total = chunks.length;
  for (let i = 0; i < total; i++) {
    const header =
      total === 1
        ? "[BASE DE CONOCIMIENTO COMPLETA — JSON íntegro de todos los documentos VLM y métricas estructuradas]"
        : `[BASE DE CONOCIMIENTO — fragmento ${i + 1}/${total}]`;
    session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [
            {
              text: `${header}\n\nUsa estos datos como única fuente autorizada. No inventes cifras.\n\n${chunks[i]}`,
            },
          ],
        },
      ],
      turnComplete: i === total - 1,
    });
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});

export interface PortfolioRecommendation {
  portfolio: "conservador" | "moderado" | "agresivo";
  nombre: string;
  perfil: string;
  plazo: string;
  razon: string;
  monto?: string;
  productosRecomendados?: string[];
  /**
   * Índices de opción elegida en cada pregunta cerrada (1-based), para SARLAFT y auditoría.
   * Deben coincidir con las opciones del guion de voz al cerrar la entrevista.
   * resp_proposito es la última pregunta (4 opciones); el resto según guion actual.
   */
  resp_proposito?: number;
  resp_ciclo?: number;
  resp_liquidez?: number;
  resp_horizonte?: number;
  resp_experiencia?: number;
  resp_expectativa_vol?: number;
  resp_reaccion?: number;
}

export type VoiceAgentMode = "onboarding" | "rebalance_advisor" | "customer_support" | "fund_advisory";

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Extrae el objeto JSON tras PORTFOLIO_JSON: / PORTFOLIO: respetando llaves y strings. */
function extractPortfolioJsonObject(buffer: string): string | null {
  let baseIdx = buffer.indexOf("PORTFOLIO_JSON:");
  let scanFrom = baseIdx >= 0 ? baseIdx + "PORTFOLIO_JSON:".length : -1;
  if (scanFrom < 0) {
    baseIdx = buffer.indexOf("PORTFOLIO:");
    if (baseIdx < 0) return null;
    scanFrom = baseIdx + "PORTFOLIO:".length;
  }
  const open = buffer.indexOf("{", scanFrom);
  if (open === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = open; i < buffer.length; i++) {
    const ch = buffer[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return buffer.slice(open, i + 1);
    }
  }
  return null;
}

function buildRebalanceAdvisorInstruction(rebalanceContext: string): string {
  return `Eres el asesor de voz de Elemento Alpha en la pantalla de rebalanceo de portafolio (demo).
Habla en español colombiano, profesional y cercano. Sé conciso; amplía solo si el usuario pide más detalle.

Tu trabajo es responder preguntas por VOZ sobre la comparación entre TU PORTAFOLIO ACTUAL (referencia) y el PORTAFOLIO SUGERIDO (rebalanceo mostrado).
NO debes guiar una encuesta de 6 preguntas. NO emitas bloques JSON ni etiquetas técnicas tipo PORTFOLIO:.

DATOS OFICIALES — úsalos tal cual; no inventes cifras ni activos fuera de este bloque:
---
${rebalanceContext}
---

Reglas:
- Si algo no está en los datos, dilo con claridad.
- Solo hay tres métricas numéricas de escenario en los datos (retorno esperado, volatilidad, max drawdown); la línea «TRM COP/USD» en la asignación es un peso sobre un activo, no una métrica adicional. Contrastalas y comenta cada activo con claridad.
- La serie histórica está normalizada (base 100); explícalo si preguntan por la gráfica.

Al iniciar la conversación (cuando el usuario acaba de conectar):
1) Saluda en una frase.
2) Resume en 2 frases breves el trade-off entre tu portafolio actual y el portafolio sugerido usando solo los datos anteriores.
3) Invita a hacer preguntas libres por voz.

Después responde solo lo que preguntan.`;
}

/** Reglas de estilo compartidas para asesoría de fondos por voz. */
const FUND_ADVISORY_VOICE_STYLE = `
Estilo de voz:
- Tutea siempre (tú, te, tu): cercano y profesional, como en una llamada real. Evita "usted", "desee" y tono institucional frío.
- Habla con naturalidad colombiana: frases cortas, pausas, sin leer listas ni sonar a presentación corporativa.
- Al leer rentabilidades del contexto, NUNCA digas "EA", "E.A." ni "e punto a". Di siempre "efectivo anual" (ej.: "nueve punto cinco por ciento efectivo anual").
- Al iniciar: saludo breve de UNA frase, una pregunta abierta y calla. No des monólogo ni resumen hasta que te pregunten.
- Después de cada respuesta: termina y espera. No encadenes otra pregunta de inmediato; deja que piensen y hablen.
- Si hay silencio, no te apresures a llenarlo: el usuario puede estar formulando su pregunta.`;

function buildFundAdvisoryAdvisorInstruction(fundContext: string): string {
  return `Eres el asesor de voz de Elemento Alpha y Alianza Fiduciaria (Colombia) en el módulo de asesoría de fondos (demo).
${FUND_ADVISORY_VOICE_STYLE}

Tu trabajo es responder por voz sobre FIC Abierto Alianza y FIC CxC Alianza: rentabilidad, riesgo, composición, liquidez, comisiones, prospectos, reglamentos y comparativas.
NO emitas bloques JSON ni etiquetas técnicas en voz.

DATOS OFICIALES — úsalos tal cual; no inventes cifras fuera de este bloque:
---
${fundContext}
---

Reglas:
- Si algo no está en los datos, dilo con claridad.
- No des asesoría tributaria/legal definitiva ni promesas de rentabilidad.
- Prioriza extractos de documentos (extractosDocumentos o documentosVlmDigest) cuando pregunten por láminas, prospecto o reglamento.
- Compara FIC Abierto vs FIC CxC usando la tabla comparativa del contexto cuando sea útil.

Al conectar (primer turno):
1) Saluda en una frase corta, tuteando (ej.: "Hola, ¿cómo estás? Soy tu asesor de fondos.").
2) Pregunta qué te gustaría saber — FIC Abierto, FIC CxC o una comparativa — y espera su respuesta.
3) No des datos ni resumen hasta que te pregunten. Cierra invitando con calma: "Cuando quieras, pregúntame lo que necesites."

Después responde solo lo que te pregunten, con pausas naturales.`;
}

function buildFundAdvisoryAdvisorInstructionRulesOnly(): string {
  return `Eres el asesor de voz de Elemento Alpha y Alianza Fiduciaria (Colombia) en el módulo de asesoría de fondos (demo).
${FUND_ADVISORY_VOICE_STYLE}

Tu trabajo es responder por voz sobre FIC Abierto Alianza y FIC CxC Alianza: rentabilidad, riesgo, composición, liquidez, comisiones, prospectos, reglamentos y comparativas.
NO emitas bloques JSON ni etiquetas técnicas en voz.

La base de conocimiento completa (JSON de cada digest VLM + métricas estructuradas) llegará en uno o más mensajes de contexto antes de que hables.
Úsala como única fuente de verdad; no inventes cifras fuera de ese corpus.

Reglas:
- Si algo no está en los datos, dilo con claridad.
- No des asesoría tributaria/legal definitiva ni promesas de rentabilidad.
- Prioriza documentosVlmDigest (JSON completo por archivo) cuando pregunten por láminas, prospecto o reglamento.
- Compara FIC Abierto vs FIC CxC usando la tabla comparativa del contexto cuando sea útil.

Al recibir la base de conocimiento (primer turno):
1) Saluda en una frase corta, tuteando.
2) Pregunta qué te gustaría saber — FIC Abierto, FIC CxC o una comparativa — y espera.
3) No des monólogo ni cifras hasta que te pregunten. Invita con calma a que pregunte cuando quiera.

Después responde solo lo que te pregunten, con pausas naturales.`;
}

function buildCustomerSupportInstruction(clientContext: string): string {
  return `Eres el agente de voz del Relationship Manager / Servicio al Cliente de ELEMENTO ALPHA (Colombia), en modo consultas ad hoc después de revisar el borrador del informe de cuenta (cliente persona jurídica demo).
Habla español colombiano, profesional y cercano. Respuestas concisas por voz; profundiza solo si lo piden.
NO ejecutes ninguna orden de mercado ni operaciones reales.

DATOS AUTORIZADOS DEL CLIENTE DEMO — úsalos tal cual; si algo no aparece aquí dilo sin inventarlo:
---
${clientContext}
---

Ejemplos de temas típicos (el usuario puede orientarse con estos; no tienes que leerlos todos en voz alta):
- ACWI COP, fortalecimiento del peso y cobertura cambiaria vs reducción marginal de global.
- RF global USD, Fed en ciclo alto y acortar duración / T-Bills vs bonos 3–7Y.
- ICOLCAP fuerte YTD y tomar utilidades parciales para financiar rebalanceo hacia IBR sin romper techo RV.
- Cómo se relacionan restricciones IPS (liquidez ≥15%, USD 15–35%, RV ≤25%, duración 0,5–2,5 años) con el estado del informe.

Reglas:
- No des asesoría tributaria/legal definitiva ni promesas de rentabilidad; usa marcos del tipo “en esta demo sintética…”.
- No emitas PORTFOLIO_JSON ni ningún objeto JSON estructurado.
- Esta es una conversación abierta tipo Q&A: no hagas una encuesta de preguntas fijas.
- Respeta el benchmark compuesto del briefing (IBR/COLTES/ICOLCAP+ACWI) y las restricciones IPS del fragmento de política.

Al conectar (primer turno después de configurar la sesión):
1) Saluda en una sola frase y menciona la razón social del cliente del bloque anterior.
2) En 2 frases resume el estado sintético (patrimonio ejemplo, alpha YTD vs benchmark si está en el bloque, una alerta clave si aplica).
3) Invita a preguntas libres por voz sobre el portafolio, contexto macro o escenarios`;
}

/** Consultas SKILLS por voz: el usuario habla como asesor comercial ante el experto simulado. */
function buildSkillsConsultVoiceInstruction(clientContext: string, skillRole: SkillRoleId): string {
  const label = SKILL_ROLE_LABELS[skillRole];
  const persona = SKILL_PROFILES_FOR_PROMPTS[skillRole];

  return `Simulas por VOZ al profesional interno de ELEMENTO ALPHA: "${label}" (consulta tipo SKILLS).
El interlocutor por micrófono es un asesor comercial que prepara la reunión con el cliente; NO es el cliente final salvo que lo diga explícitamente.
Responde con la mirada, vocabulario y límites de ese rol. Español colombiano, profesional, respuestas breves por voz; amplía solo si piden profundidad.
NO ejecutes órdenes de mercado ni prometas rentabilidades.

PERFIL / FRONTERAS DEL ROL:
---
${persona}
---

DATOS AUTORIZADOS DEL CLIENTE DEMO — úsalos tal cual; si algo no aparece dilo sin inventarlo:
---
${clientContext}
---

Reglas:
- Respeta IPS/benchmark del briefing cuando el asesor pregunta por argumentos frente al cliente Acropolis Labs SAS (PJ).
- Si la pregunta pertenece claramente a otro rol del sistema SKILLS, indica en una frase a quién escalarías y responde solo lo que toca tu perfil.
- No emitas PORTFOLIO_JSON ni JSON estructurado.

Al conectar (primer turno):
1) Saluda en una frase como ese perfil interno (sin lecturas largas).
2) En una frase resume que escucharás consultas por voz para ayudar al asesor.
3) Invita a la primera pregunta por voz.`;
}

export type VoiceIntakeData = { nombre: string; empresa: string; nit?: string; sector?: string };

function buildSystemInstruction(
  financialContext?: string,
  intakeData?: VoiceIntakeData
): string {
  const financialBlock = financialContext
    ? `\n\nCONTEXTO FINANCIERO DEL CLIENTE (extraído de sus estados financieros):\n---\n${financialContext}\n---\nUsa estos datos para personalizar y justificar la recomendación de portafolio.`
    : "";

  const clientBlock = intakeData
    ? `\n\nINFORMACIÓN DEL CLIENTE:\n- Nombre (representante legal): ${intakeData.nombre}\n- Empresa: ${intakeData.empresa}\n- NIT: ${intakeData.nit?.trim() || "No indicado"}${
        intakeData.sector?.trim()
          ? `\n- Sector: ${intakeData.sector.trim()}`
          : ""
      }\nDirige al cliente por su nombre y menciona su empresa cuando sea relevante.`
    : "";

  return `Eres el asesor virtual de Elemento Alpha, plataforma colombiana de Fondos de Inversión Colectiva (FIC).
Tu misión es realizar un perfilamiento con EXACTAMENTE 7 preguntas cerradas (de opción) y al final enrutar a un portafolio.
Habla en español colombiano. Sé conciso, empático y profesional. NUNCA hagas más de una pregunta a la vez. ESPERA la respuesta antes de continuar.${clientBlock}${financialBlock}
Evita muletillas y repeticiones. No digas frases como "súper", "eh", "digamos", "vale", "perfecto" en cada turno. Redacta cada intervención de forma natural y variada.

GUION OBLIGATORIO (sigue este orden estricto):

BIENVENIDA:
- Saluda al cliente por su nombre.
- Menciona su empresa.
- Pregunta explícitamente: "¿Cómo estás hoy?".
- Dile que le harás 7 preguntas cortas para recomendarle la mejor opción de inversión.
- Dile que, si algo no se entiende, puede hacer todas las preguntas que quiera.
- INICIA INMEDIATAMENTE al conectarte, sin esperar que el usuario hable primero.
- No uses etiquetas tipo "pregunta 1", "pregunta 2", etc. Debe sonar como conversación natural.
- Primera intervención sugerida: "Hola <nombre>, ¿cómo estás hoy? Soy tu asesor virtual de Elemento Alpha y quiero conocerte mejor para recomendarte una buena alternativa de inversión para tu empresa. Si algo no queda claro, me preguntas con total confianza."

PRIMERA PREGUNTA (debe ir de primeras):
¿Cómo definirías el ciclo en el que se encuentra hoy la empresa?
Opciones:
1) Empresa joven, que está creciendo y su foco está 100% en el negocio y reinversión.
2) Empresa con trayectoria, que busca rentabilizar la liquidez y contemplar inversiones de mediano/largo plazo.
3) Empresa madura, interesada en optimizar liquidez y rentabilizar inversiones en diferentes vehículos.

Luego pregunta:
Al momento de hacer una inversión, disponer del dinero de forma inmediata es:
Opciones:
1) Muy relevante.
2) Algo relevante.
3) Nada relevante.

Luego pregunta:
El periodo de tiempo que la empresa espera contar con la liquidez es:
Opciones:
1) Menos de 1 año.
2) Entre 1 y 5 años.
3) Más de 5 años.

Luego pregunta:
Selecciona la opción que define mejor el nivel de involucramiento de tu empresa en inversiones:
Opciones:
1) Experiencia en productos bancarios tradicionales (ahorros/corriente/CDTs).
2) Además de productos bancarios, experiencia en fondos de inversión colectiva.
3) Además de lo anterior, experiencia en bonos y/o portafolios de acciones.
4) Además de lo anterior, experiencia en productos sofisticados (notas estructuradas, derivados, capital privado, etc.).

Luego pregunta:
¿Cuál escenario se adecúa mejor a las expectativas de tu compañía al invertir?
Opciones:
1) Comportamiento constante y pocas fluctuaciones.
2) Cómodos con valorizaciones/desvalorizaciones moderadas para obtener retornos moderados.
3) Cómodos con alta variación buscando retornos altos.

Luego pregunta:
Suponiendo una desvalorización en el corto plazo, la decisión sería:
Opciones:
1) Retirar la totalidad del dinero.
2) Retirar una parte e invertir el resto en opciones más seguras.
3) Esperar a que el portafolio se recupere.
4) Esperar e invertir más para aprovechar precios bajos.

ÚLTIMA PREGUNTA (cierra el perfilamiento):
¿Cuál es el propósito principal de esta inversión para la empresa?
Opciones:
1) Proyecto Productivo / Expansión de Planta
2) Optimización de Excedentes de Tesorería
3) Reconversión Tecnológica / Digitalización
4) Fondo de Reserva para Pasivos Laborales

REGLAS DE CONDUCCIÓN:
- Si el usuario responde ambiguo, repregunta SOLO esa pregunta, mostrando opciones resumidas.
- Si el usuario responde con texto libre, mapea su respuesta a la opción más cercana y confírmala brevemente.
- El usuario puede terminar cuando quiera; si quiere parar, entrega recomendación provisional.
- Al dar opciones, hazlo natural en una sola frase corta, sin enumeración rígida.
- El usuario puede preguntar en cualquier momento; responde su duda brevemente y luego retoma la entrevista con naturalidad.
- No uses frases como "recuerda que esto es para perfilar" ni variantes similares.

SCORING INTERNO (no lo expliques salvo que te lo pidan):
- Para ciclo/liquidez/horizonte/expectativa: opción 1=1 punto, 2=2 puntos, 3=3 puntos.
- Para propósito, experiencia en inversiones y reacción ante desvalorización: opción 1=1 punto, 2=2 puntos, 3=3 puntos, 4=4 puntos.
- Suma total esperada: mínimo 7, máximo 24.

CATÁLOGO APROBADO PARA PERSONA JURÍDICA (usa solo estos nombres):
- FIC líquido
- FIC Simple General
- FIC Horizontes
- FIC ESTABLE
- Fondo Alternativo
- Fondo Cartera
- Fondo Ahorro Empresarial
- Fiducia Inmobiliaria
- Fiducia Estructurada
- Fiducia de Garantía

ROUTING:
- conservador: 7 a 12
- moderado: 13 a 18
- agresivo: 19 a 24

AL FINAL (después de la última respuesta o si el usuario decide terminar):
- Da una conclusión breve en voz (máx 2 frases).
- En una línea aparte, agrega SOLO este metadato en texto plano (un único objeto JSON válido; incluye SIEMPRE las claves resp_* con el número entero de la opción elegida por el cliente en cada pregunta, 1-based):
PORTFOLIO_JSON:{"portfolio":"conservador|moderado|agresivo","nombre":"FIC líquido|FIC Horizontes|FIC ESTABLE","perfil":"Conservador|Moderado|Agresivo","plazo":"corto plazo|mediano plazo|largo plazo","razon":"razón concreta en 1 frase","monto":"monto mencionado o no especificado","productosRecomendados":["producto 1","producto 2","producto 3"],"resp_ciclo":2,"resp_liquidez":3,"resp_horizonte":1,"resp_experiencia":2,"resp_expectativa_vol":2,"resp_reaccion":3,"resp_proposito":4}
Donde resp_* DEBEN reflejar las respuestas reales del cliente en este mismo orden del guion:
- resp_ciclo: pregunta ciclo de la empresa (1–3).
- resp_liquidez: pregunta disponer dinero de forma inmediata (1–3).
- resp_horizonte: pregunta periodo de liquidez esperado (1–3).
- resp_experiencia: pregunta nivel de experiencia en inversiones (1–4).
- resp_expectativa_vol: pregunta expectativa ante volatilidad (1–3).
- resp_reaccion: pregunta reacción ante desvalorización (1–4).
- resp_proposito: propósito de la inversión para la empresa, última pregunta (1–4).
Si el usuario cortó antes de terminar, estima resp_* coherente con lo dicho hasta ese momento y dilo en razon.
- No expliques ni repitas el JSON.
- Nunca cierres la llamada abruptamente; despídete con una frase breve y cordial.

PLAZO SUGERIDO:
- conservador => corto plazo
- moderado => mediano plazo
- agresivo => largo plazo

SELECCIÓN DE PRODUCTOS (persona jurídica):
- conservador: prioriza FIC líquido, Fondo Ahorro Empresarial, Fiducia de Garantía.
- moderado: prioriza FIC Horizontes, Fondo Cartera, Fondo Alternativo.
- agresivo: prioriza FIC ESTABLE, Fondo Alternativo, Fiducia Inmobiliaria.

IMPORTANTE:
- productosRecomendados debe contener entre 2 y 4 productos exactos del catálogo aprobado.
- No inventes nombres fuera del catálogo.`;
}

interface UseVoiceAgentOptions {
  voiceName?: string;
  /** Por defecto perfilamiento onboarding; `rebalance_advisor` usa solo preguntas libres sobre portafolio actual vs sugerido. */
  mode?: VoiceAgentMode;
  /** Bloque JSON/texto con métricas y asignaciones (requerido si mode === "rebalance_advisor"). */
  rebalanceContext?: string;
  /** Narrativa + tabla resumen cliente demo (mode === "customer_support"). */
  customerSupportContext?: string;
  /** Si se define con mode customer_support, instrucción = perfil SKILLS (PM, estratega, etc.). */
  skillConsultRole?: SkillRoleId;
  /** Contexto compacto de fondos + extractos JSON (mode === "fund_advisory"). Igual que rebalanceContext. */
  fundAdvisoryContext?: string;
  financialContext?: string;
  intakeData?: VoiceIntakeData;
  onRecommendation?: (rec: PortfolioRecommendation) => void;
}

function resolveSystemInstruction(opts: {
  mode: VoiceAgentMode;
  rebalanceContext?: string;
  customerSupportContext?: string;
  skillConsultRole?: SkillRoleId;
  fundAdvisoryContext?: string;
  financialContext?: string;
  intakeData?: VoiceIntakeData;
}): string {
  if (opts.mode === "rebalance_advisor") {
    const ctx = opts.rebalanceContext?.trim();
    return buildRebalanceAdvisorInstruction(ctx || "(Contexto de portafolio aún no disponible.)");
  }
  if (opts.mode === "customer_support") {
    const ctx = opts.customerSupportContext?.trim();
    const safeCtx = ctx || "(Contexto del cliente demo aún no disponible.)";
    if (opts.skillConsultRole) {
      return buildSkillsConsultVoiceInstruction(safeCtx, opts.skillConsultRole);
    }
    return buildCustomerSupportInstruction(safeCtx);
  }
  if (opts.mode === "fund_advisory") {
    const ctx = opts.fundAdvisoryContext?.trim();
    if (ctx && ctx.length <= FUND_ADVISORY_INLINE_CONTEXT_MAX) {
      return buildFundAdvisoryAdvisorInstruction(ctx);
    }
    return buildFundAdvisoryAdvisorInstructionRulesOnly();
  }
  return buildSystemInstruction(opts.financialContext, opts.intakeData);
}

export function useVoiceAgent({
  voiceName = "Zephyr",
  mode = "onboarding",
  rebalanceContext,
  customerSupportContext,
  skillConsultRole,
  fundAdvisoryContext,
  financialContext,
  intakeData,
  onRecommendation,
}: UseVoiceAgentOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Refs de recursos ──────────────────────────────────────────────────────
  const sessionRef = useRef<Promise<LiveVoiceSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);      // captura 16kHz
  const playAudioContextRef = useRef<AudioContext | null>(null);  // reproducción 24kHz
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const transcriptBufferRef = useRef<string>("");
  /** Transcripción acumulada (texto del modelo en Live) para extracción SARLAFT posterior. */
  const fullInterviewTranscriptRef = useRef<string>("");
  const onRecommendationRef = useRef(onRecommendation);
  const modeRef = useRef(mode);
  const fundAdvisoryContextRef = useRef(fundAdvisoryContext);

  useEffect(() => {
    onRecommendationRef.current = onRecommendation;
  }, [onRecommendation]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    fundAdvisoryContextRef.current = fundAdvisoryContext;
  }, [fundAdvisoryContext]);

  // ── Reproducción de audio PCM base64 (24kHz) ─────────────────────────────
  const playBase64Pcm = useCallback((base64: string) => {
    if (!playAudioContextRef.current) return;
    const ctx = playAudioContextRef.current;

    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextPlayTimeRef.current < currentTime) nextPlayTimeRef.current = currentTime;
    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += buffer.duration;

    activeSourcesRef.current.push(source);
    setIsSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) setIsSpeaking(false);
    };
  }, []);

  // ── Detener reproducción (interrupciones) ────────────────────────────────
  const stopAudioPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* ignore */
      }
    });
    activeSourcesRef.current = [];
    if (playAudioContextRef.current) {
      nextPlayTimeRef.current = playAudioContextRef.current.currentTime;
    }
    setIsSpeaking(false);
  }, []);

  // ── Limpieza completa ────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      void sessionRef.current.then((s) => {
        try {
          s.close();
        } catch {
          /* ignore */
        }
      });
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    stopAudioPlayback();
    if (playAudioContextRef.current) {
      playAudioContextRef.current.close().catch(() => {});
      playAudioContextRef.current = null;
    }
  }, [stopAudioPlayback]);

  // ── Finalizar sesión ─────────────────────────────────────────────────────
  const getInterviewTranscript = useCallback(() => fullInterviewTranscriptRef.current.trim(), []);

  const endSession = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
  }, [cleanup]);

  // ── Iniciar sesión Live ──────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    transcriptBufferRef.current = "";
    fullInterviewTranscriptRef.current = "";

    try {
      // 1. Contexto de reproducción a 24kHz
      playAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playAudioContextRef.current.currentTime;

      // 2. Configurar micrófono ANTES de conectar a Gemini
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);

      const workletCode = `
        class AudioRecorder extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const channelData = input[0];
              const pcm16 = new Int16Array(channelData.length);
              for (let i = 0; i < channelData.length; i++) {
                let s = Math.max(-1, Math.min(1, channelData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              this.port.postMessage(pcm16);
            }
            return true;
          }
        }
        registerProcessor('audio-recorder', AudioRecorder);
      `;
      const blob = new Blob([workletCode], { type: "application/javascript" });
      await audioContextRef.current.audioWorklet.addModule(URL.createObjectURL(blob));
      const recorderNode = new AudioWorkletNode(audioContextRef.current, "audio-recorder");

      // 3. Conectar a Gemini Live
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction: resolveSystemInstruction({
            mode,
            rebalanceContext,
            customerSupportContext,
            skillConsultRole,
            fundAdvisoryContext,
            financialContext,
            intakeData,
          }),
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsConnected(true);

            void sessionPromise.then((session) => {
              const liveSession = session as LiveVoiceSession;
              const ctx = fundAdvisoryContextRef.current?.trim();
              if (
                modeRef.current === "fund_advisory" &&
                ctx &&
                ctx.length > FUND_ADVISORY_INLINE_CONTEXT_MAX
              ) {
                sendFundAdvisoryContextChunks(liveSession, ctx);
              }

              // Activar envío de audio tras inyectar contexto
              recorderNode.port.onmessage = (e) => {
                const pcm16 = e.data;
                const buffer = new ArrayBuffer(pcm16.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < pcm16.length; i++) view.setInt16(i * 2, pcm16[i], true);
                let binary = "";
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);

                try {
                  liveSession.sendRealtimeInput({
                    audio: { data: window.btoa(binary), mimeType: "audio/pcm;rate=16000" },
                  });
                } catch {
                  /* envío rechazado si la sesión ya cerró */
                }
              };

              source.connect(recorderNode);
              recorderNode.connect(audioContextRef.current!.destination);
            });
          },

          onmessage: (message: LiveServerMessage) => {
            console.log("[Gemini] message:", JSON.stringify(message).slice(0, 200));

            // Setup completo — el servidor está listo
            if (message.setupComplete) {
              console.log("[Gemini] setup completo ✓");
            }

            // Manejar interrupciones
            if (message.serverContent?.interrupted) {
              stopAudioPlayback();
            }

            // Reproducir audio de respuesta
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                playBase64Pcm(part.inlineData.data);
              }
              if (part.text && modeRef.current === "onboarding") {
                transcriptBufferRef.current += part.text;
                fullInterviewTranscriptRef.current += part.text;
                const jsonSlice = extractPortfolioJsonObject(transcriptBufferRef.current);
                if (jsonSlice) {
                  const rec = safeJsonParse<PortfolioRecommendation>(jsonSlice);
                  if (rec?.portfolio) {
                    onRecommendationRef.current?.(rec);
                    transcriptBufferRef.current = "";
                  }
                }
              }
            }

            if (modeRef.current === "onboarding") {
              const raw = message.serverContent as Record<string, unknown> | undefined;
              const inp = raw?.inputTranscription as { text?: string } | undefined;
              if (inp?.text?.trim()) {
                fullInterviewTranscriptRef.current += `\n[Cliente]: ${inp.text.trim()}\n`;
              }
            }
          },

          onerror: (err) => {
            console.error("Gemini Live error:", err);
            setError("Error de conexión. Intenta de nuevo.");
            cleanup();
            setIsConnected(false);
            setIsConnecting(false);
          },

          onclose: (event: VoiceCloseReason) => {
            console.warn("Sesión Gemini cerrada:", event?.code, event?.reason);
            cleanup();
            if (event?.code && event.code !== 1000) {
              setError(formatLiveCloseError(event.code, event.reason));
            }
            setIsConnected(false);
            setIsConnecting(false);
          },
        },
      });

      sessionRef.current = sessionPromise as Promise<LiveVoiceSession>;

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("No se pudo conectar con la IA.");
      cleanup();
      setIsConnecting(false);
    }
  }, [
    voiceName,
    mode,
    rebalanceContext,
    customerSupportContext,
    skillConsultRole,
    fundAdvisoryContext,
    financialContext,
    intakeData,
    playBase64Pcm,
    stopAudioPlayback,
    cleanup,
  ]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  return { startSession, endSession, isConnected, isConnecting, isSpeaking, error, getInterviewTranscript };
}
