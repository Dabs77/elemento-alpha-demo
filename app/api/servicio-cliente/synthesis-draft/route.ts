import { NextRequest } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { GEMINI_3_FLASH_PREVIEW, geminiGenerateContentUrl } from "@/lib/geminiGenerateContentModel";
import {
  getKnowledgeBaseFull,
  SKILL_ROLE_IDS,
  SKILL_ROLE_LABELS,
  type SkillRoleId,
} from "@/lib/servicio-cliente/knowledgeBase";
import {
  ACTIVE_ALERTS,
  CLIENT_QA_SCRIPT,
  COMPARISON_VS_BENCHMARK,
  HNW_CLIENT_DEMO,
  REBALANCE_Q2_2026_ROWS,
} from "@/lib/servicio-cliente/hnwAlejandroReport";

const GEMINI_URL = geminiGenerateContentUrl(GEMINI_3_FLASH_PREVIEW);

function isSkillRoleId(x: string): x is SkillRoleId {
  return (SKILL_ROLE_IDS as readonly string[]).includes(x);
}

export async function POST(request: NextRequest) {
  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const body = (await request.json()) as {
    role?: string;
    recentSkillReply?: string;
  };

  const roleRaw = body.role ?? "portfolio_manager_senior";
  const recent = (body.recentSkillReply ?? "").trim();

  if (!isSkillRoleId(roleRaw)) {
    return Response.json({ error: "Rol inválido" }, { status: 400 });
  }

  const roleLabel = SKILL_ROLE_LABELS[roleRaw];
  const kb = getKnowledgeBaseFull();

  const facts = `
Cliente: ${HNW_CLIENT_DEMO.nombre}
Patrimonio demo: ${HNW_CLIENT_DEMO.patrimonioTotal}
Comparación vs benchmark (Q1): ${COMPARISON_VS_BENCHMARK.map((r) => `${r.metric} ${r.portfolio} vs ${r.benchmark}`).join("; ")}
Alertas: ${ACTIVE_ALERTS.map((a) => a.alerta).join(" | ")}
Filas propuesta Q2 (demo): ${REBALANCE_Q2_2026_ROWS.map((r) => `${r.item}: ${r.actual}→${r.propuesto}`).join("; ")}
Guion Q&A ejemplo interno: ${CLIENT_QA_SCRIPT.map((x) => `P:${x.preguntaCliente}`).join(" · ")}
`.trim();

  const prompt = `
Genera un BORRADOR ejecutivo para el asesor comercial de ELEMENTO ALPHA (demo interna).

Contexto fijo del caso:
${facts}

Última respuesta del skill consultado (${roleLabel}) — úsala como matiz principal si aporta contenido:
---
${recent || "(sin consulta skill previa en esta sesión — usa solo el contexto fijo.)"}
---

BASE IPS (no contradecir):
---
${kb.slice(0, 4500)}
---

Salida OBLIGATORIA en markdown con exactamente dos secciones con estos encabezados:

## Respuestas sugeridas al cliente
- 3 a 6 bullets accionables que el asesor pueda decir casi textual en reunión, integrando alertas (ACWI COP, RF global, ICOLCAP) y el tono del skill.

## Propuesta formal de rebalanceo — Q2 2026 (borrador narrativo)
- 1 párrafo corto + lista de 4 ítems máximo alineados a las filas propuesta Q2 demo (sin prometer rentabilidades).

Reglas: español CO; sin orden de mercado; sin asesoría legal/tributaria definitiva; marca "demo sintética" en una frase.
`.trim();

  const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const error = await geminiResponse.text();
    return Response.json({ error: error.slice(0, 400) }, { status: geminiResponse.status });
  }

  const data = await geminiResponse.json();
  const reply: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return Response.json({ reply });
}
