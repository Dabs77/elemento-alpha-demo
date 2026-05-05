import { NextRequest } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { GEMINI_3_FLASH_PREVIEW, geminiGenerateContentUrl } from "@/lib/geminiGenerateContentModel";
import {
  getKnowledgeBaseFull,
  GOVERNANCE_RULES,
  SKILL_PROFILES_FOR_PROMPTS,
  type SkillRoleId,
  SKILL_ROLE_IDS,
  SKILL_ROLE_LABELS,
} from "@/lib/servicio-cliente/knowledgeBase";
import {
  getSkillsPredefinedExactReply,
  SKILLS_PREDEFINED_QA_PROMPT_BLOCK,
} from "@/lib/servicio-cliente/skillConsultPredefinedQA";

const GEMINI_URL = geminiGenerateContentUrl(GEMINI_3_FLASH_PREVIEW);

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

function isSkillRoleId(x: string): x is SkillRoleId {
  return (SKILL_ROLE_IDS as readonly string[]).includes(x);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    role?: string;
    question?: string;
    history?: GeminiContent[];
  };

  const roleRaw = body.role ?? "";
  const question = (body.question ?? "").trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!isSkillRoleId(roleRaw)) {
    return Response.json({ error: "Rol inválido" }, { status: 400 });
  }
  if (!question) {
    return Response.json({ error: "Pregunta vacía" }, { status: 400 });
  }

  const predefinedReply = getSkillsPredefinedExactReply(question);
  if (predefinedReply !== null) {
    return Response.json({ reply: predefinedReply });
  }

  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const roleLabel = SKILL_ROLE_LABELS[roleRaw];
  const persona = SKILL_PROFILES_FOR_PROMPTS[roleRaw];
  const kb = getKnowledgeBaseFull();

  const systemInstruction = `
Eres una réplica asistida del rol: ${roleLabel} en ELEMENTO ALPHA (Colombia). Esta es una DEMO interna para capacitar al asesor comercial.

${persona}

BASE DE CONOCIMIENTO AUTORIZADA (no contradigas; si falta data dilo):
---
${kb}
---

${SKILLS_PREDEFINED_QA_PROMPT_BLOCK}

REGLAS OPERATIVAS ADICIONALES:
${GOVERNANCE_RULES}

Formato:
- Español colombiano, profesional.
- Respuesta útil en 3–8 párrafos cortos o bullets cuando ayude al asesor a hablar con el cliente final.
- Si la consulta es puramente de otro rol, indica en una frase a quién escalar y entrega solo contexto útil de tu dominio.
- No inventes cifras de mercado en tiempo real fuera del brief demo del cliente HNW cuando el usuario no las dio.
`.trim();

  const contents: GeminiContent[] = [
    ...history.slice(-8),
    { role: "user", parts: [{ text: question }] },
  ];

  const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        role: "user",
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.22,
        maxOutputTokens: 2048,
        topP: 0.9,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const error = await geminiResponse.text();
    console.error("skill-consult Gemini error:", geminiResponse.status, error);
    return Response.json({ error: error.slice(0, 400) }, { status: geminiResponse.status });
  }

  const data = await geminiResponse.json();
  const reply: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return Response.json({ reply });
}
