import type { PdfPageVlmExtraction, PdfVisualElementExtraction } from "@/lib/onboarding/pdfVlmDigestTypes";
import { geminiServerFetch, formatGeminiTlsHint, geminiFetchErrorMessage } from "@/lib/geminiServerFetch";

const GEMINI_MODEL = "gemini-3.1-pro-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `Eres un modelo de visión especializado en documentos corporativos y financieros.
Tu tarea es extraer TODA la información útil de UNA página renderizada como imagen.

Prioridades:
1) Tablas: transcribe encabezados y celdas; si es muy grande, resume por bloques pero conserva cifras clave.
2) Gráficos (barras, líneas, tortas, combinados): describe tipo, ejes, unidades, leyendas, series, tendencias y valores/tickers numéricos VISIBLES (aproxima si no son exactos).
3) Diagramas / infografías / mapas / capturas de pantalla: describe jerarquía, etiquetas y mensajes cuantitativos o cualitativos.
4) Fotos / logos / sellos / firmas: describe solo si aportan información (ej. nombre entidad, fecha legible).

Salida SIEMPRE en JSON válido según el esquema solicitado en el mensaje del usuario.
No inventes datos que no puedas ver; si algo es ilegible dilo explícitamente.
Responde en español.`;

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
      "Gemini cortó la respuesta por límite de tokens (MAX_TOKENS). Prueba un PDF menos denso o vuelve a intentar esta página."
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

function userPrompt(pageNumber: number, totalPages: number, fileName: string): string {
  return `Archivo: "${fileName}". Página ${pageNumber} de ${totalPages}.

Devuelve un JSON con esta forma exacta (campos opcionales pueden omitirse o ir vacíos):
{
  "pageNumber": ${pageNumber},
  "tituloInferido": "string o vacío",
  "textoTranscripcion": "todo el texto corrido legible",
  "elementosVisuales": [
    {
      "tipo": "grafico_tabla_imagen_diagrama_otro",
      "descripcionInformacion": "descripción profunda de QUÉ información se muestra",
      "metadataVisual": "ejes, leyendas, unidades, series…",
      "datosObservados": "cifras o rangos legibles"
    }
  ],
  "tablasMarkdown": "tablas en Markdown si aplica, o vacío",
  "markdownCompleto": "informe markdown de esta página: encabezados ## ###, listas, negritas para métricas clave; integra texto + síntesis de cada visual."
}`;
}

export async function analyzePdfPagePngWithGemini(opts: {
  apiKey: string;
  pngBuffer: Buffer;
  pageNumber: number;
  totalPages: number;
  fileName: string;
}): Promise<PdfPageVlmExtraction> {
  const { apiKey, pngBuffer, pageNumber, totalPages, fileName } = opts;

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
              { text: userPrompt(pageNumber, totalPages, fileName) },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 16384,
          topP: 0.9,
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
