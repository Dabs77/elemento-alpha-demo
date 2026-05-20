import { NextResponse } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { geminiServerFetch } from "@/lib/geminiServerFetch";
import { searchFundAdvisoryRag } from "@/lib/asesoria/fundAdvisoryRag";
import { BrainboxApiError } from "@/lib/asesoria/brainboxClient";

const GEMINI_MODEL = process.env.FUND_ADVISORY_COMPOSE_MODEL?.trim() || "gemini-3.1-pro-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRY_QUERIES = 2;

const SYSTEM_PROMPT = `Eres un agente experto que redacta respuestas claras y naturales para un asesor de voz de Alianza Fiduciaria (Colombia) sobre los fondos FIC Abierto Alianza y FIC CxC Alianza.

Recibirás:
1. La PREGUNTA del usuario.
2. Los FRAGMENTOS recuperados desde una base de conocimiento (BrainBox) con datos oficiales de prospectos, reglamentos, desempeño, comisiones, composición, etc.

Tu trabajo es redactar una respuesta corta, conversacional, en español colombiano, que será leída en voz alta. NUNCA digas que no tienes la información: todos los datos necesarios están en los fragmentos o pueden obtenerse pidiendo otra consulta.

REGLAS DE OUTPUT — devuelve EXCLUSIVAMENTE un objeto JSON válido (sin backticks, sin texto antes o después), con UNA de estas tres formas:

A) Respuesta lista para hablar (PREFERIDA):
{"action":"answer","text":"<respuesta natural en 2-5 frases, sin asteriscos ni emojis>"}

B) Necesitas otra consulta a BrainBox (SOLO si los fragmentos claramente NO mencionan lo preguntado):
{"action":"requery","query":"<reformulación más específica con otras palabras clave>"}

C) La pregunta del usuario es genuinamente ambigua y necesitas aclarar:
{"action":"clarify","text":"<pregunta corta para pedir aclaración>"}

IMPORTANTE: El output debe empezar con la llave de apertura y terminar con la llave de cierre. NO uses markdown, NO uses code fences, NO escribas nada fuera del JSON.

REGLAS DE REDACCIÓN cuando action=answer:
- Usa SOLO datos presentes en los fragmentos. NO inventes cifras.
- Habla en español colombiano, tuteando, profesional pero cercano.
- Sé breve y directo: 2-5 frases máximo. La respuesta se va a leer en voz.
- NO uses asteriscos, listas, emojis ni caracteres especiales.
- NO menciones "los fragmentos", "BrainBox", "el documento dice", "el JSON". Habla con autoridad propia.
- Pronuncia el fondo CxC como "ce por ce" (escribe literal "ce por ce" en el texto).
- Cifras: di "punto" para decimales (15.9% → "quince punto nueve por ciento"), o escríbelas tal cual (15.9%) y deja que el TTS las lea.
- NO des asesoría legal/tributaria definitiva ni prometas rentabilidad futura.

REFERENCIA TEMPORAL:
- Recibirás un campo FECHA DE HOY con la fecha actual (zona horaria de Colombia).
- Úsala para interpretar expresiones relativas del usuario como "hoy", "ayer", "este mes", "el último año", "lo corrido del año", "el trimestre pasado", etc.
- NO asumas que la fecha de tu entrenamiento es la fecha de hoy; la fecha autoritativa es la que viene en FECHA DE HOY.
- Las cifras de los fragmentos pueden estar cortadas a un cierre anterior (ej: "cifras al cierre marzo 2026"); respeta esa fecha de corte al responder.

REGLAS para action=requery:
- Úsalo SOLO si los fragmentos claramente no contienen la respuesta (ej: pregunta sobre comisiones y los fragmentos son sobre rentabilidad).
- La nueva query debe ser más específica o usar otras palabras clave.

REGLAS para action=clarify:
- Úsalo cuando la pregunta del usuario sea genuinamente ambigua (ej: "y la rentabilidad?" sin especificar fondo o periodo).
- La pregunta debe ser muy corta (1 frase).

PREFIERE action=answer siempre que sea posible. requery y clarify son excepciones.`;

type ComposeAction =
  | { action: "answer"; text: string }
  | { action: "requery"; query: string }
  | { action: "clarify"; text: string };

const SPANISH_WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const SPANISH_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function getBogotaTodayString(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));

  const utcMidnight = new Date(Date.UTC(year, month - 1, day));
  const weekday = SPANISH_WEEKDAYS[utcMidnight.getUTCDay()];
  const monthName = SPANISH_MONTHS[month - 1];
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");

  return `${weekday} ${day} de ${monthName} de ${year} (${dd}/${mm}/${year}, zona horaria America/Bogota)`;
}

function buildPrompt(query: string, ragContext: string, attempt: number): string {
  return `FECHA DE HOY: ${getBogotaTodayString()}

PREGUNTA DEL USUARIO:
${query}

FRAGMENTOS RECUPERADOS DE BRAINBOX (intento ${attempt}):
---
${ragContext || "(sin fragmentos)"}
---

Redacta tu respuesta como JSON según las reglas. Recuerda: NUNCA digas que no tienes la información.`;
}

function stripJsonFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  }
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }
  return s.trim();
}

async function callGeminiCompose(query: string, ragContext: string, attempt: number): Promise<ComposeAction> {
  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  const res = await geminiServerFetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: buildPrompt(query, ragContext, attempt) }] },
      ],
      systemInstruction: {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        thinkingConfig: { thinkingBudget: 512 },
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            action: { type: "STRING", enum: ["answer", "requery", "clarify"] },
            text: { type: "STRING" },
            query: { type: "STRING" },
          },
          required: ["action"],
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini compose error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const finishReason: string | undefined = data?.candidates?.[0]?.finishReason;

  console.log(`[compose] Gemini (${GEMINI_MODEL}) finishReason=${finishReason ?? "?"} chars=${text.length}`);
  if (!text) {
    console.warn(`[compose] Respuesta vacía de Gemini. Data:`, JSON.stringify(data).slice(0, 500));
    return {
      action: "answer",
      text: "Permíteme un momento, déjame consultar de nuevo.",
    };
  }

  const cleaned = stripJsonFences(text);

  try {
    const parsed = JSON.parse(cleaned) as ComposeAction;
    if (parsed.action === "answer" && typeof parsed.text === "string" && parsed.text.trim()) return parsed;
    if (parsed.action === "requery" && typeof parsed.query === "string" && parsed.query.trim()) return parsed;
    if (parsed.action === "clarify" && typeof parsed.text === "string" && parsed.text.trim()) return parsed;
    console.warn(`[compose] JSON con formato inesperado:`, cleaned.slice(0, 300));
  } catch (err) {
    console.warn(`[compose] JSON.parse falló:`, err instanceof Error ? err.message : err);
    console.warn(`[compose] Raw (300 chars):`, text.slice(0, 300));
  }

  // Fallback: usar texto crudo como respuesta si parece prosa natural
  const fallbackText = cleaned.replace(/[{}"]/g, "").trim();
  if (fallbackText.length > 20) {
    return { action: "answer", text: fallbackText };
  }

  return {
    action: "answer",
    text: "Permíteme un momento, déjame revisar los datos con más detalle.",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { query?: string; topK?: number };
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "query requerido" }, { status: 400 });
    }

    let currentQuery = query;
    let lastRagContext = "";

    for (let attempt = 1; attempt <= MAX_RETRY_QUERIES + 1; attempt++) {
      const ragResult = await searchFundAdvisoryRag(currentQuery, { topK: body.topK ?? 8 });
      lastRagContext = ragResult.context;

      console.log(`[compose] Intento ${attempt} → query: "${currentQuery}" → ${ragResult.chunks.length} chunks`);

      const composed = await callGeminiCompose(query, lastRagContext, attempt);

      if (composed.action === "answer") {
        console.log(`[compose] ✓ Respuesta: "${composed.text.slice(0, 120)}..."`);
        return NextResponse.json({
          action: "answer",
          text: composed.text,
          originalQuery: query,
          attempts: attempt,
        });
      }

      if (composed.action === "clarify") {
        console.log(`[compose] ? Clarify: "${composed.text}"`);
        return NextResponse.json({
          action: "clarify",
          text: composed.text,
          originalQuery: query,
          attempts: attempt,
        });
      }

      if (composed.action === "requery" && attempt <= MAX_RETRY_QUERIES) {
        console.log(`[compose] ↻ Requery: "${composed.query}"`);
        currentQuery = composed.query;
        continue;
      }

      // Reached max retries: force an answer with whatever we have
      console.log(`[compose] ⚠ Max retries alcanzado, forzando respuesta`);
      const forced = await callGeminiCompose(
        `${query}\n\n[NO PUEDES PEDIR OTRA CONSULTA. Genera la mejor respuesta posible con los fragmentos actuales.]`,
        lastRagContext,
        attempt + 1,
      );
      return NextResponse.json({
        action: "answer",
        text: forced.action === "answer" ? forced.text : "Permíteme un momento, déjame revisar los datos con más detalle.",
        originalQuery: query,
        attempts: attempt,
        forced: true,
      });
    }

    return NextResponse.json({
      action: "answer",
      text: "Permíteme un momento, déjame revisar los datos.",
      originalQuery: query,
    });
  } catch (err) {
    console.error("[compose]", err);
    if (err instanceof BrainboxApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status ?? 502 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
