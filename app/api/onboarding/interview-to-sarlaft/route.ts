import { NextRequest } from "next/server";
import {
  parseSarlaftInterviewProfileJson,
  SARLAFT_INTERVIEW_CICLO,
  SARLAFT_INTERVIEW_EXPERIENCIA,
  SARLAFT_INTERVIEW_LIQUIDEZ,
  SARLAFT_INTERVIEW_TOLERANCIA,
  stripPortfolioJsonFromTranscript,
} from "@/lib/sarlaft/interviewToSarlaftProfile";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const EXTRACTION_PROMPT = `Eres un asistente técnico que EXTRAE respuestas de una entrevista de perfilamiento de inversión (persona jurídica en Colombia).

Recibirás una transcripción que incluye preguntas y respuestas del asesor virtual y del cliente (a veces solo el lado del asesor, donde el cliente respondió por voz).

Tu tarea: deducir únicamente estos cuatro datos para un formulario regulatorio SARLAFT. Debes responder con UN SOLO objeto JSON válido y nada más (sin markdown, sin comentarios).

Claves obligatorias en el JSON (usa exactamente estos nombres de clave):
- "ciclo_empresa"
- "liquidez"
- "experiencia_inversion"
- "tolerancia_riesgo"

Valores PERMITIDOS (copia textual exacta, caracter por caracter):

ciclo_empresa DEBE ser exactamente uno de:
${JSON.stringify([...SARLAFT_INTERVIEW_CICLO])}

liquidez (disponibilidad del dinero) DEBE ser exactamente uno de:
${JSON.stringify([...SARLAFT_INTERVIEW_LIQUIDEZ])}

experiencia_inversion DEBE ser exactamente uno de:
${JSON.stringify([...SARLAFT_INTERVIEW_EXPERIENCIA])}

tolerancia_riesgo DEBE ser exactamente uno de:
${JSON.stringify([...SARLAFT_INTERVIEW_TOLERANCIA])}

Reglas:
- Infiera las respuestas solo a partir del contenido de la transcripción. Si algo no está claro, elige la opción más cercana al sentido declarado por el cliente; si fuera totalmente ilegible, usa la opción más conservadora plausible (menor riesgo / mayor liquidez / menor sofisticación), y refleja la incertidumbre solo en valores permitidos — no inventes nuevas etiquetas.
- La entrevista sigue típicamente: ciclo de la empresa → necesidad de liquidez inmediata → horizonte de tiempo (puede aclarar liquidez) → experiencia en productos financieros → expectativa ante volatilidad → decisión ante desvalorización temporal → objetivo/propósito. Usa la pregunta de "disponer del dinero de forma inmediata" para liquidez; si solo aparece horizonte, puedes inferir liquidez (corto = Muy relevante, medio = Algo, largo = Nada relevante).
- No incluyas otras claves. No incluyas explicaciones.`;

function unwrapJsonCandidate(s: string): string {
  const t = s.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```/im.exec(t);
  if (fence?.[1]) return fence[1].trim();
  const i = t.indexOf("{");
  const j = t.lastIndexOf("}");
  if (i >= 0 && j > i) return t.slice(i, j + 1);
  return t;
}

interface GeminiGeneratePart {
  text?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });
  }

  let body: { transcript?: string };
  try {
    body = (await request.json()) as { transcript?: string };
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const raw = stripPortfolioJsonFromTranscript(String(body.transcript ?? "").trim());
  if (raw.length < 40) {
    return Response.json(
      parseSarlaftInterviewProfileJson({}),
      { status: 200 }
    );
  }

  const userText = `${EXTRACTION_PROMPT}\n\n--- TRANSCRIPCIÓN ---\n${raw.slice(0, 120000)}`;

  const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    console.error("interview-to-sarlaft Gemini error:", geminiResponse.status, errText);
    return Response.json({ error: "Error extrayendo perfil" }, { status: 502 });
  }

  const data = await geminiResponse.json();
  const reply: string =
    data.candidates?.[0]?.content?.parts?.map((p: GeminiGeneratePart) => p.text ?? "").join("") ?? "";

  let parsed: unknown = null;
  try {
    const cleaned = unwrapJsonCandidate(reply || "{}");
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = null;
  }

  const profile = parseSarlaftInterviewProfileJson(parsed ?? {});
  return Response.json(profile);
}
