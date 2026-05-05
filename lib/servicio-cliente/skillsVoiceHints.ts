import type { SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";

export type SkillVoiceHint = { topic: string; ejemplo: string };

/** Ideas para pronunciar en micrófono según el perfil SKILLS seleccionado. */
export const SKILL_VOICE_HINTS: Record<SkillRoleId, SkillVoiceHint[]> = {
  portfolio_manager_senior: [
    {
      topic: "ACWI COP vs USD",
      ejemplo:
        'Ej.: "¿Cómo explico que la caída en COP fue cambiaria y no necesariamente mala señal de equities?"',
    },
    {
      topic: "Duración RF global",
      ejemplo:
        'Ej.: "¿Qué argumentos uso para rotar de largos del Treasury hacia T-Bills ante Fed alta?"',
    },
    {
      topic: "Toma ICOLCAP",
      ejemplo: 'Ej.: "¿El 5% de utilidades parciales hacia IBR califica como táctica defendible?"',
    },
  ],
  wealth_advisor_senior: [
    {
      topic: "Traducción al cliente",
      ejemplo:
        'Ej.: "¿Cómo digo que la cobertura FX no es especulación sino alinear IPS?"',
    },
    {
      topic: "Objetivos vs benchmark",
      ejemplo:
        'Ej.: "¿Cómo comunico alpha sin sonar a promesa de rentabilidad?"',
    },
    {
      topic: "Miedo a global",
      ejemplo:
        'Ej.: "La empresa quiere salir de todo lo USD — ¿cómo encuadro límites del perfil moderado?"',
    },
  ],
  investment_strategist: [
    {
      topic: "Tesis táctica Q2",
      ejemplo:
        'Ej.: "¿Cuál es nuestra postura casa ante peso fuerte + COLTES?"',
    },
    {
      topic: "Escenarios Fed/Banrep",
      ejemplo:
        'Ej.: "Si hay sólo 1–2 cortes Fed en 2026, ¿cómo posicionamos RF USD corta?"',
    },
    {
      topic: "Ruido vs señal",
      ejemplo:
        'Ej.: "¿Qué titular macro ignoramos esta semana respecto al portafolio cliente?"',
    },
  ],
  chief_economist: [
    {
      topic: "TRM y cuenta corriente",
      ejemplo:
        'Ej.: "¿Qué lectura macro damos del peso fuerte para reuniones con cliente?"',
    },
    {
      topic: "IPC vs tasas",
      ejemplo:
        'Ej.: "¿Inflación convergiendo cambia el mensaje sobre COLTES corporativo?"',
    },
    {
      topic: "Comunicado Banrep",
      ejemplo:
        'Ej.: "En dos frases, ¿qué significó la última decisión para RV local?"',
    },
  ],
};
