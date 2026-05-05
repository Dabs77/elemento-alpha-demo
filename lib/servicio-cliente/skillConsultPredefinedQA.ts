/**
 * Guiones de respuesta prioritarios para la demo del chat SKILLS (`skill-consult`).
 * La IA debe anclar la respuesta a este contenido cuando la consulta sea equivalente.
 */

export const SKILLS_PREDEFINED_QA_PROMPT_BLOCK = `
GUIONES DE PREGUNTA–RESPUESTA (demo · prioridad alta)
Si la consulta del asesor es equivalente o claramente sobre el mismo tema que alguno de los bloques siguientes,
DEBES responder usando ese contenido como núcleo obligatorio de la respuesta. Puedes:
- Reorganizar en markdown (subtítulos breves, párrafos, viñetas) y mejorar la fluidez en español colombiano profesional.
- No contradigas los argumentos, cifras, porcentajes ni conclusiones del guión.
- No añadas datos de mercado nuevos que no estén en el guión ni en la KB general autorizada.
- Si mezclan varios temas, prioriza el guión que mejor encaje primero; luego puedes un breve matiz desde tu rol si no choca con el guión.

---

[PREDEF 1 · Mesadas pensionales · asignación]
Pregunta modelo:
"Deseo tener un portafolio que me permita cubrir unas mesadas pensionales, ¿cuál debe ser mi asignación estratégica de activos?"

Respuesta modelo:
Un portafolio de estas características debe ser moderado–moderado arriesgado, con un porcentaje relevante en títulos indexados a IPC y a UVR, en especial de larga duración.

---

[PREDEF 2 · Alta exposición en moneda extranjera]
Pregunta modelo:
"El portafolio que me sugieres tiene una alta exposición en moneda extranjera, ¿por qué lo recomiendas?"

Respuesta modelo:
Claro: viendo tu edad y tus otros productos, estás muy cargado en activos en moneda local aunque estén diversificados, pero no estás diversificado frente al riesgo país. Además, en nuestra entrevista me dijiste que querías estudiar en el exterior en unos 5 años.

---

[PREDEF 3 · COLTES y déficit fiscal]
Pregunta modelo:
"¿Qué tan seguro es tener COLTES si el gobierno colombiano tiene déficit fiscal?"

Respuesta modelo:
Colombia mantiene calificación crediticia de grado de inversión (Fitch: BB+, Moody's: Baa2). Si bien el déficit fiscal es una preocupación real — estimado en 4,5% del PIB para 2026 — el riesgo de impago en el corto plazo es muy bajo. El gobierno tiene acceso a mercados de capital internacionales y reservas internacionales de USD 60.000M. Para el horizonte de 1–3 años del portafolio, el riesgo no es de default sino de mark-to-market: si las tasas suben, los precios bajan temporalmente. Por eso hay mayor peso en COLTES corto plazo (CP) que en largo plazo (LP), reduciendo la duración modificada y la sensibilidad a movimientos de tasa.

---

[PREDEF 4 · Peso fuerte y cobertura USD]
Pregunta modelo:
"El peso se fortaleció mucho. ¿Debo convertir más activos en dólares como cobertura?"

Respuesta modelo:
La apreciación del peso fue de −12,7% YTD, impulsada por flujos de portafolio hacia Colombia, altos diferenciales de tasas y remesas. Técnicamente, el peso está sobrevaluado según modelos de PPA (paridad de poder adquisitivo) con un tipo de cambio de equilibrio entre $3.900 y $4.100. Esto sugiere que la apreciación adicional tiene límites y que podría haber una corrección en el segundo semestre de 2026. Por eso NO se recomienda aumentar la exposición en USD en este momento, sino mantener el 23% actual y usar coberturas (forwards USD/COP) para proteger el valor de lo ya invertido en dólares. Aumentar exposición en dólares hoy sería comprar caro con riesgo de reversa.

---

[PREDEF 5 · Finca raíz y liquidez]
Pregunta modelo:
"¿Por qué tengo finca raíz en el portafolio si es poco líquida?"

Respuesta modelo:
La exposición a finca raíz (5% del portafolio, ~$60M COP) no es directa sino a través de FICs de inversión inmobiliaria, que tienen mayor liquidez que la propiedad directa. La razón de incluirla es su baja correlación con los activos financieros: históricamente, cuando las tasas bajan y el peso se aprecia, los valores de los inmuebles en COP suben. Además, el rendimiento de +7,26% en un año aporta diversificación real al portafolio. Dicho eso, dado el horizonte de corto plazo, se acordó mantenerla en máximo 5% y no ampliarla.
`.trim();

/** Normaliza solo para comparar igualdad con los prompts predefinidos (trim + espacios internos). */
export function normalizeSkillsConsultQuestion(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export type SkillsPredefinedQuestionItem = {
  id: string;
  label: string;
  /** Texto exacto que debe enviar el asesor para activar la respuesta literal. */
  prompt: string;
  /** Respuesta oficial demo; sin pasar por el modelo. */
  reply: string;
};

/** Etiquetas cortas para la UI (rellenan el campo de consulta). */
export const SKILLS_PREDEFINED_QUESTION_LABELS: SkillsPredefinedQuestionItem[] = [
  {
    id: "predef-1",
    label: "Mesadas pensionales · asignación",
    prompt:
      "Deseo tener un portafolio que me permita cubrir unas mesadas pensionales, ¿cuál debe ser mi asignación estratégica de activos?",
    reply:
      "Un portafolio de estas características debe ser moderado–moderado arriesgado, con un porcentaje relevante en títulos indexados a IPC y a UVR, en especial de larga duración.",
  },
  {
    id: "predef-2",
    label: "¿Por qué tanta exposición USD?",
    prompt:
      "El portafolio que me sugieres tiene una alta exposición en moneda extranjera, ¿por qué lo recomiendas?",
    reply:
      "Claro: viendo tu edad y tus otros productos, estás muy cargado en activos en moneda local aunque estén diversificados, pero no estás diversificado frente al riesgo país. Además, en nuestra entrevista me dijiste que querías estudiar en el exterior en unos 5 años.",
  },
  {
    id: "predef-3",
    label: "COLTES y déficit fiscal",
    prompt: "¿Qué tan seguro es tener COLTES si el gobierno colombiano tiene déficit fiscal?",
    reply:
      "Colombia mantiene calificación crediticia de grado de inversión (Fitch: BB+, Moody's: Baa2). Si bien el déficit fiscal es una preocupación real — estimado en 4,5% del PIB para 2026 — el riesgo de impago en el corto plazo es muy bajo. El gobierno tiene acceso a mercados de capital internacionales y reservas internacionales de USD 60.000M. Para el horizonte de 1–3 años del portafolio, el riesgo no es de default sino de mark-to-market: si las tasas suben, los precios bajan temporalmente. Por eso hay mayor peso en COLTES corto plazo (CP) que en largo plazo (LP), reduciendo la duración modificada y la sensibilidad a movimientos de tasa.",
  },
  {
    id: "predef-4",
    label: "Peso fuerte · más USD",
    prompt:
      "El peso se fortaleció mucho. ¿Debo convertir más activos en dólares como cobertura?",
    reply:
      "La apreciación del peso fue de −12,7% YTD, impulsada por flujos de portafolio hacia Colombia, altos diferenciales de tasas y remesas. Técnicamente, el peso está sobrevaluado según modelos de PPA (paridad de poder adquisitivo) con un tipo de cambio de equilibrio entre $3.900 y $4.100. Esto sugiere que la apreciación adicional tiene límites y que podría haber una corrección en el segundo semestre de 2026. Por eso NO se recomienda aumentar la exposición en USD en este momento, sino mantener el 23% actual y usar coberturas (forwards USD/COP) para proteger el valor de lo ya invertido en dólares. Aumentar exposición en dólares hoy sería comprar caro con riesgo de reversa.",
  },
  {
    id: "predef-5",
    label: "Finca raíz y liquidez",
    prompt: "¿Por qué tengo finca raíz en el portafolio si es poco líquida?",
    reply:
      "La exposición a finca raíz (5% del portafolio, ~$60M COP) no es directa sino a través de FICs de inversión inmobiliaria, que tienen mayor liquidez que la propiedad directa. La razón de incluirla es su baja correlación con los activos financieros: históricamente, cuando las tasas bajan y el peso se aprecia, los valores de los inmuebles en COP suben. Además, el rendimiento de +7,26% en un año aporta diversificación real al portafolio. Dicho eso, dado el horizonte de corto plazo, se acordó mantenerla en máximo 5% y no ampliarla.",
  },
];

/** Si la pregunta coincide (normalizada) con un prompt predefinido, devuelve la respuesta literal acordada. */
export function getSkillsPredefinedExactReply(question: string): string | null {
  const key = normalizeSkillsConsultQuestion(question);
  for (const row of SKILLS_PREDEFINED_QUESTION_LABELS) {
    if (normalizeSkillsConsultQuestion(row.prompt) === key) {
      return row.reply;
    }
  }
  return null;
}
