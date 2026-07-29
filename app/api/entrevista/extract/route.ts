import { NextResponse } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { geminiServerFetch, geminiFetchErrorMessage } from "@/lib/geminiServerFetch";
import {
  FICHA_RESPONSE_SCHEMA,
  computeCompleteness,
  computeMissing,
  mergeFicha,
  type EntrevistaFicha,
  type EntrevistaSetup,
} from "@/lib/entrevista/harness";
import {
  buildExtractionPrompt,
  getExtractionSystemPrompt,
} from "@/lib/entrevista/prompts";

const GEMINI_MODEL = process.env.ENTREVISTA_EXTRACT_MODEL?.trim() || "gemini-3.1-pro-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Gemini a veces envuelve el JSON en fences pese a responseMimeType. Mismo saneo que fund-advisory-compose. */
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

async function callGeminiExtract(
  setup: EntrevistaSetup,
  fichaActual: EntrevistaFicha,
  transcript: string
): Promise<EntrevistaFicha> {
  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  const res = await geminiServerFetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildExtractionPrompt(setup, fichaActual, transcript) }],
        },
      ],
      systemInstruction: {
        role: "user",
        parts: [{ text: getExtractionSystemPrompt() }],
      },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: FICHA_RESPONSE_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini extract error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    console.warn("[entrevista/extract] Respuesta vacía de Gemini");
    return {};
  }

  try {
    return JSON.parse(stripJsonFences(text)) as EntrevistaFicha;
  } catch (err) {
    // Una extracción ilegible no debe tumbar la entrevista: se devuelve vacía y
    // el merge conservador deja la ficha intacta.
    console.warn(
      "[entrevista/extract] JSON.parse falló:",
      err instanceof Error ? err.message : err
    );
    console.warn("[entrevista/extract] Raw (300 chars):", text.slice(0, 300));
    return {};
  }
}

function parseSetup(raw: unknown): EntrevistaSetup | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const empresa = typeof s.empresa === "string" ? s.empresa.trim() : "";
  const area = typeof s.area === "string" ? s.area.trim() : "";
  const rol = typeof s.rol === "string" ? s.rol.trim() : "";
  if (!empresa || !area || !rol) return null;
  return { empresa, area, rol };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      setup?: unknown;
      fichaActual?: EntrevistaFicha;
      transcript?: string;
    };

    const setup = parseSetup(body.setup);
    if (!setup) {
      return NextResponse.json(
        { error: "setup requerido con empresa, area y rol" },
        { status: 400 }
      );
    }

    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    if (!transcript) {
      return NextResponse.json({ error: "transcript requerido" }, { status: 400 });
    }

    const fichaActual: EntrevistaFicha =
      body.fichaActual && typeof body.fichaActual === "object" ? body.fichaActual : {};

    const extracted = await callGeminiExtract(setup, fichaActual, transcript);
    const ficha = mergeFicha({ ...fichaActual, ...setup }, extracted);

    console.log(
      `[entrevista/extract] ${GEMINI_MODEL} · transcript=${transcript.length} chars · completitud=${computeCompleteness(ficha)}%`
    );

    return NextResponse.json({
      ficha,
      missing: computeMissing(ficha),
      completeness: computeCompleteness(ficha),
    });
  } catch (err) {
    const message = geminiFetchErrorMessage(err);
    console.error("[entrevista/extract] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
