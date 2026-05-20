import type { PdfPageVlmExtraction, PdfVisualElementExtraction } from "@/lib/onboarding/pdfVlmDigestTypes";
import { geminiServerFetch, formatGeminiTlsHint, geminiFetchErrorMessage } from "@/lib/geminiServerFetch";

const GEMINI_MODEL = "gemini-3.1-pro-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `Eres un modelo de visión EXTREMADAMENTE METICULOSO especializado en documentos corporativos y financieros.
Tu tarea es extraer ABSOLUTAMENTE TODA la información visible de UNA página renderizada como imagen. NO OMITAS NADA.

## REGLAS CRÍTICAS DE EXTRACCIÓN EXHAUSTIVA:

1) **TEXTO**: Transcribe TODO el texto visible, incluyendo:
   - Títulos, subtítulos, encabezados de sección
   - Párrafos completos (NO resumas, transcribe literal)
   - Notas al pie, disclaimers, textos pequeños
   - Números de página, fechas, referencias
   - Textos en márgenes, headers, footers

2) **TABLAS**: Transcribe CADA celda de CADA tabla:
   - TODOS los encabezados de columna y fila
   - TODOS los valores numéricos exactos (no aproximes)
   - TODAS las unidades (%, $, COP, etc.)
   - Si hay subtotales o totales, inclúyelos
   - Formatea en Markdown con | para que sea legible

3) **GRÁFICOS** (barras, líneas, tortas, áreas, combinados):
   - Tipo exacto de gráfico
   - Título del gráfico
   - Etiquetas de TODOS los ejes (X, Y, secundario si aplica)
   - Unidades de cada eje
   - TODOS los valores de la leyenda/series
   - LEE CADA PUNTO de datos visible (valores exactos o aproximados)
   - Tendencias y comparaciones

4) **DIAGRAMAS / INFOGRAFÍAS / FLUJOS**:
   - Describe la estructura completa
   - CADA caja/nodo y su contenido textual
   - CADA flecha/conexión y lo que representa
   - Porcentajes, números, métricas visibles

5) **IMÁGENES / LOGOS / ICONOS**:
   - Nombre de empresa/entidad si es visible
   - Texto dentro o junto a la imagen
   - Contexto informativo que aporta

## FORMATO DE SALIDA:
- El campo "markdownCompleto" debe ser un documento Markdown EXHAUSTIVO que integre TODO
- Usa ## para secciones, ### para subsecciones
- Usa **negritas** para cifras y métricas clave
- Incluye las tablas en formato Markdown
- NO resumas: transcribe y describe TODO

## PROHIBIDO:
- NO omitas información por considerarla "redundante"
- NO resumas párrafos largos
- NO aproximes números si son legibles
- NO ignores texto pequeño o en márgenes

Si algo es ilegible, indica "[ilegible]" pero intenta extraer lo que puedas.
Responde SIEMPRE en español.
Salida SIEMPRE en JSON válido según el esquema solicitado.`;

function stripJsonFences(s: string): string {
  let t = s.trim();
  if (t.startsWith("```json")) t = t.slice(7);
  else if (t.startsWith("```")) t = t.slice(3);
  t = t.trim();
  if (t.endsWith("```")) t = t.slice(0, -3).trim();
  return t;
}

/** Primer objeto `{ ... }` balanceado respetando strings (respuestas con texto antes/después del JSON). */
function extractFirstBalancedJsonObject(s: string): string | null {
  const start = s.search(/\{/);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function parseGeminiJson(raw: string): unknown {
  const trimmed = raw?.trim();
  if (!trimmed) throw new Error("Respuesta de IA vacía.");

  const attempts: Array<{ label: string; fn: () => unknown }> = [
    { label: "directo", fn: () => JSON.parse(trimmed) },
    { label: "sin cercados markdown", fn: () => JSON.parse(stripJsonFences(trimmed)) },
    {
      label: "primer objeto JSON en texto",
      fn: () => {
        const slice = extractFirstBalancedJsonObject(trimmed);
        if (!slice) throw new SyntaxError("sin objeto JSON");
        return JSON.parse(slice);
      },
    },
    {
      label: "primer objeto tras cercados",
      fn: () => {
        const slice = extractFirstBalancedJsonObject(stripJsonFences(trimmed));
        if (!slice) throw new SyntaxError("sin objeto JSON");
        return JSON.parse(slice);
      },
    },
  ];

  let lastErr: unknown;
  for (const { fn } of attempts) {
    try {
      return fn();
    } catch (e) {
      lastErr = e;
    }
  }

  const preview = trimmed.length > 500 ? `${trimmed.slice(0, 500)}…` : trimmed;
  const cause = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`Respuesta de IA no es JSON válido (${cause}). Fragmento: ${preview}`);
}

/** Une todo el texto de `parts` y detecta bloqueos / respuesta vacía. */
function extractGeminiCandidateText(data: unknown): string {
  const root = data as {
    error?: { message?: string; code?: number };
    promptFeedback?: { blockReason?: string };
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  if (root.error?.message) {
    throw new Error(`Gemini API: ${root.error.message}`);
  }

  const block = root.promptFeedback?.blockReason;
  if (block) {
    throw new Error(`Gemini bloqueó la solicitud (${block}).`);
  }

  const cand = root.candidates?.[0];
  if (!cand) {
    throw new Error("Gemini no devolvió candidatos (revisa cuota, modelo o contenido).");
  }

  const fr = cand.finishReason;
  if (fr === "SAFETY" || fr === "BLOCKLIST") {
    throw new Error(`Gemini detuvo la respuesta por políticas (${fr}).`);
  }
  if (fr === "MAX_TOKENS") {
    throw new Error(
      "Gemini cortó la respuesta por límite de tokens (MAX_TOKENS). Aumenta max_tokens y vuelve a intentar."
    );
  }
  if (fr === "RECITATION") {
    throw new Error(
      "Gemini detectó contenido protegido (RECITATION). Activa 'Modo paráfrasis' y vuelve a intentar."
    );
  }

  const parts = cand.content?.parts ?? [];
  const texts = parts.map((p) => (typeof p.text === "string" ? p.text : ""));
  const joined = texts.join("\n").trim();
  if (!joined) {
    throw new Error(
      `Gemini devolvió texto vacío (finishReason=${fr ?? "desconocido"}).`
    );
  }
  return joined;
}

/** Esquema REST para salida JSON más estable con modelos compatibles. */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    pageNumber: { type: "NUMBER" },
    tituloInferido: { type: "STRING" },
    textoTranscripcion: { type: "STRING" },
    elementosVisuales: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          tipo: { type: "STRING" },
          descripcionInformacion: { type: "STRING" },
          metadataVisual: { type: "STRING" },
          datosObservados: { type: "STRING" },
        },
      },
    },
    tablasMarkdown: { type: "STRING" },
    markdownCompleto: { type: "STRING" },
  },
  required: ["pageNumber", "markdownCompleto"],
} as const;

function userPromptParaphrase(pageNumber: number, totalPages: number, fileName: string, additionalInstructions?: string): string {
  const basePrompt = `Archivo: "${fileName}". Página ${pageNumber} de ${totalPages}.

IMPORTANTE: PARAFRASEA todo el contenido. NO copies texto literalmente. Describe y reformula la información con tus propias palabras.

Devuelve un JSON con esta forma exacta:
{
  "pageNumber": ${pageNumber},
  "tituloInferido": "título principal de la página si existe (parafraseado)",
  "textoTranscripcion": "PARÁFRASIS del contenido textual - reformula con tus palabras manteniendo el significado",
  "elementosVisuales": [
    {
      "tipo": "grafico|tabla|imagen|diagrama|infografia|otro",
      "descripcionInformacion": "descripción del contenido y su significado",
      "metadataVisual": "descripción de ejes, leyendas, estructura",
      "datosObservados": "valores numéricos observados (los números sí se pueden incluir exactos)"
    }
  ],
  "tablasMarkdown": "Tablas con datos numéricos (números exactos OK) pero con encabezados y descripciones parafraseadas",
  "markdownCompleto": "Documento Markdown que PARAFRASEA la información. Los NÚMEROS y DATOS pueden ser exactos, pero el TEXTO debe estar reformulado. Usa ## para títulos, ### para subtítulos."
}`;

  if (additionalInstructions) {
    return `${basePrompt}\n\n## INSTRUCCIONES ADICIONALES:\n${additionalInstructions}`;
  }
  return basePrompt;
}

function userPrompt(pageNumber: number, totalPages: number, fileName: string, additionalInstructions?: string): string {
  const basePrompt = `Archivo: "${fileName}". Página ${pageNumber} de ${totalPages}.

EXTRAE ABSOLUTAMENTE TODO. No omitas nada. Cada texto, cada número, cada elemento visual.

Devuelve un JSON con esta forma exacta:
{
  "pageNumber": ${pageNumber},
  "tituloInferido": "título principal de la página si existe",
  "textoTranscripcion": "TRANSCRIPCIÓN LITERAL Y COMPLETA de todo el texto visible en la página, sin resumir",
  "elementosVisuales": [
    {
      "tipo": "grafico|tabla|imagen|diagrama|infografia|otro",
      "descripcionInformacion": "descripción EXHAUSTIVA de qué información comunica este elemento",
      "metadataVisual": "ejes, leyendas, unidades, series, etiquetas - TODO lo visible",
      "datosObservados": "TODOS los valores numéricos, porcentajes, cifras que puedas leer"
    }
  ],
  "tablasMarkdown": "TODAS las tablas transcritas en formato Markdown con CADA celda",
  "markdownCompleto": "Documento Markdown COMPLETO y EXHAUSTIVO que integra: 1) Todo el texto transcrito, 2) Todas las tablas en formato MD, 3) Descripción detallada de cada gráfico/visual con sus datos. Usa ## para títulos, ### para subtítulos, **negritas** para cifras clave. NO RESUMAS, incluye TODO."
}`;

  if (additionalInstructions) {
    return `${basePrompt}\n\n## INSTRUCCIONES ADICIONALES DEL USUARIO:\n${additionalInstructions}\n\nPresta especial atención a lo que el usuario indica que falta.`;
  }
  return basePrompt;
}

function userPromptWithFeedback(pageNumber: number, totalPages: number, fileName: string, feedback: string): string {
  return userPrompt(pageNumber, totalPages, fileName, feedback);
}

const DEFAULT_MAX_TOKENS = 65536;

export async function analyzePdfPagePngWithGemini(opts: {
  apiKey: string;
  pngBuffer: Buffer;
  pageNumber: number;
  totalPages: number;
  fileName: string;
  feedback?: string;
  maxTokens?: number;
  paraphraseMode?: boolean;
}): Promise<PdfPageVlmExtraction> {
  const { apiKey, pngBuffer, pageNumber, totalPages, fileName, feedback, maxTokens, paraphraseMode } = opts;

  const promptFn = paraphraseMode ? userPromptParaphrase : userPrompt;
  const promptText = promptFn(pageNumber, totalPages, fileName, feedback || undefined);

  let res: Response;
  try {
    res = await geminiServerFetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: pngBuffer.toString("base64"),
                },
              },
              { text: promptText },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: maxTokens ?? DEFAULT_MAX_TOKENS,
          topP: 0.95,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });
  } catch (e) {
    throw new Error(formatGeminiTlsHint(geminiFetchErrorMessage(e)));
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 400)}`);
  }

  const data: unknown = await res.json();
  const raw = extractGeminiCandidateText(data);

  const parsed = parseGeminiJson(raw) as Partial<PdfPageVlmExtraction> | null;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Extracción inválida.");
  }

  const markdownCompleto =
    typeof parsed.markdownCompleto === "string" && parsed.markdownCompleto.trim()
      ? parsed.markdownCompleto.trim()
      : typeof parsed.textoTranscripcion === "string"
        ? parsed.textoTranscripcion.trim()
        : "(Sin contenido extraído para esta página.)";

  return {
    pageNumber,
    tituloInferido: typeof parsed.tituloInferido === "string" ? parsed.tituloInferido : undefined,
    textoTranscripcion: typeof parsed.textoTranscripcion === "string" ? parsed.textoTranscripcion : undefined,
    elementosVisuales: Array.isArray(parsed.elementosVisuales)
      ? (parsed.elementosVisuales as unknown[]).filter((x): x is PdfVisualElementExtraction => {
          if (typeof x !== "object" || x === null) return false;
          const o = x as Record<string, unknown>;
          return typeof o.tipo === "string";
        }).map((x) => {
          const o = x as Record<string, unknown>;
          return {
            tipo: String(o.tipo),
            descripcionInformacion:
              typeof o.descripcionInformacion === "string"
                ? o.descripcionInformacion
                : typeof o.descripcionInformacion === "undefined"
                  ? ""
                  : String(o.descripcionInformacion ?? ""),
            metadataVisual: typeof o.metadataVisual === "string" ? o.metadataVisual : undefined,
            datosObservados: typeof o.datosObservados === "string" ? o.datosObservados : undefined,
          };
        })
      : undefined,
    tablasMarkdown: typeof parsed.tablasMarkdown === "string" ? parsed.tablasMarkdown : undefined,
    markdownCompleto,
  };
}
