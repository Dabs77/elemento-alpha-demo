/**
 * Transcripción y conclusiones demo · reunión trimestral Q1 2026.
 * Cliente corporativo: Acropolis Labs SAS (coherente con ficha informe).
 */

export type MeetingSpeaker = "asesor" | "cliente";

export interface MeetingUtterance {
  speaker: MeetingSpeaker;
  /** Etiqueta corta en burbuja (ej. ASESOR · Elemento Alpha) */
  badge: string;
  text: string;
}

export const SIMULATED_MEETING_TRANSCRIPT: MeetingUtterance[] = [
  {
    speaker: "asesor",
    badge: "ASESOR · Elemento Alpha",
    text: 'Buenos días. Gracias por su tiempo. Les traemos el resumen del primer trimestre 2026. En términos generales, el portafolio tuvo un comportamiento positivo, con un rendimiento ponderado YTD de +1,96%, superando el benchmark en 35 puntos básicos. Hay, sin embargo, tres puntos que queremos analizar en detalle.',
  },
  {
    speaker: "cliente",
    badge: "CLIENTE · Acropolis Labs SAS",
    text: 'Me alegra que estemos por encima del benchmark. Nos preocupa un poco lo que vemos en la parte internacional. ¿Qué pasó con el ACWI?',
  },
  {
    speaker: "asesor",
    badge: "ASESOR · Elemento Alpha",
    text: 'Muy buena observación. El ACWI en COP cayó -6,54% en el trimestre, pero esto no fue por el mercado accionario global en sí — en USD el ACWI estuvo relativamente plano. El efecto fue principalmente cambiario: el peso colombiano se apreció fuertemente, de $4.207 a $3.673 por dólar, lo que impactó la valoración en COP de todas las posiciones en dólares. Dicho eso, en términos de 1 año, el ACWI COP sigue en +3,04%, que está dentro del rango esperado.',
  },
  {
    speaker: "cliente",
    badge: "CLIENTE · Acropolis Labs SAS",
    text: '¿Y deberíamos mantener o reducir esa posición? Tenemos entendido que la Fed no va a bajar tasas tan rápido.',
  },
  {
    speaker: "asesor",
    badge: "ASESOR · Elemento Alpha",
    text: 'Correcto. La Fed mantiene el rango de 4,25-4,50%, y el mercado descuenta sólo 1-2 recortes en 2026. En ese contexto, los bonos del Tesoro de largo plazo siguen bajo presión. Nuestra propuesta es acortar la duración de la RF global: salir parcialmente del Bloomberg Aggregate (LEGATRUU) y rotar hacia T-Bills de corto plazo, que hoy ofrecen cerca de 4,2% en USD. En cuanto al ACWI, proponemos mantener la posición por fundamentales pero implementar una cobertura cambiaria USD/COP para proteger entre el 50% y el 70% de la exposición en dólares.',
  },
  {
    speaker: "cliente",
    badge: "CLIENTE · Acropolis Labs SAS",
    text: '¿Y el ICOLCAP? Tuvimos retornos de más del 13% en el trimestre. ¿Es sostenible?',
  },
  {
    speaker: "asesor",
    badge: "ASESOR · Elemento Alpha",
    text: 'El ICOLCAP tuvo una recuperación notable impulsada por: (1) la apreciación del peso, que reduce el costo de importación para empresas listadas; (2) la convergencia de la inflación, que libera margen operativo; y (3) una prima de riesgo que el mercado había exagerado a la baja. Creemos que hay algo de recorrido aún, pero en niveles actuales el riesgo/retorno no justifica ampliar la posición. Recomendamos tomar utilidades del 5% de la posición (aproximadamente $7,2M COP) y rotarlos hacia IBR 12M, que ofrece hoy un 10,4% efectivo anual con bajo riesgo.',
  },
  {
    speaker: "cliente",
    badge: "CLIENTE · Acropolis Labs SAS",
    text: '¿Y nuestros objetivos financieros para el año? ¿Vamos en línea?',
  },
  {
    speaker: "asesor",
    badge: "ASESOR · Elemento Alpha",
    text: 'Los objetivos planteados para el año eran: (1) obtener un retorno real positivo, es decir, superar la inflación de ~5,8%, y (2) no sufrir pérdidas de capital superiores al 5%. En ambos estamos en camino. El portafolio lleva +1,96% en el trimestre y, extrapolando con el comportamiento de la renta fija colombiana y los ajustes que proponemos, proyectamos cerrar 2026 con un retorno entre +8,5% y +11% en COP. En USD, dado el fortalecimiento del peso, el retorno esperado en términos relativos es menor, cerca de 5-7%.',
  },
];

export const MEETING_CONCLUSIONS: string[] = [
  "Portafolio generó alpha de +35 bps vs. benchmark en Q1 2026.",
  "El impacto cambiario fue el principal factor de ruido en la posición global.",
  "Ciclo bajista de Banrep favorece la valoración de COLTES y bonos corporativos de tasa fija.",
  "Se acuerda presentar propuesta formal de rebalanceo en los próximos 5 días hábiles.",
  "Próxima reunión de revisión: julio de 2026 (fin de Q2).",
];
