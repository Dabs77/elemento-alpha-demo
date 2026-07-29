/**
 * Harness de entrevista de necesidades.
 *
 * Fuente única de verdad del esquema: define los campos de la ficha, cuáles son
 * obligatorios, cómo se calcula qué falta y cómo se fusionan extracciones sucesivas.
 *
 * Lo consumen tres piezas que no se conocen entre sí:
 *  - `app/api/entrevista/extract/route.ts` usa `FICHA_RESPONSE_SCHEMA` para forzar
 *    la salida estructurada de Gemini.
 *  - `hooks/useEntrevistaAgent.ts` usa `mergeFicha` y `computeMissing` para saber
 *    qué debe repreguntar el agente.
 *  - `components/entrevista/FichaPanel.tsx` usa `computeCompleteness` y las etiquetas.
 */

export type Impacto = "alto" | "medio" | "bajo";
export type Urgencia = "alta" | "media" | "baja";

export interface EntrevistaSetup {
  empresa: string;
  area: string;
  rol: string;
}

export interface Proceso {
  nombre: string;
  frecuencia?: string;
  duracionAprox?: string;
  manual?: boolean;
}

export interface Dolor {
  descripcion: string;
  impacto?: Impacto;
  frecuencia?: string;
}

export interface Herramienta {
  nombre: string;
  usoPrincipal?: string;
  satisfaccion?: string;
}

export interface Volumen {
  metrica: string;
  valor: string;
  periodo?: string;
}

export interface EntrevistaFicha {
  empresa?: string;
  area?: string;
  rol?: string;
  responsabilidades?: string[];
  procesos?: Proceso[];
  dolores?: Dolor[];
  herramientas?: Herramienta[];
  volumen?: Volumen[];
  personasInvolucradas?: number;
  kpis?: string[];
  intentosPrevios?: string[];
  urgencia?: Urgencia;
  citasTextuales?: string[];
}

export type FichaFieldKey = keyof EntrevistaFicha;

interface FieldSpec {
  key: FichaFieldKey;
  /** Etiqueta legible: se muestra en la UI y se le dicta al agente. */
  label: string;
  required: boolean;
  /** Mínimo de entradas para considerar el campo cubierto (solo listas). */
  minItems?: number;
  /** Qué debería preguntar el agente para llenarlo. */
  hint: string;
}

/**
 * Orden de declaración = orden de indagación. El agente prioriza el primer campo
 * faltante, así que esta lista es literalmente el guion de la entrevista.
 */
export const FICHA_FIELDS: readonly FieldSpec[] = [
  {
    key: "responsabilidades",
    label: "Responsabilidades",
    required: true,
    minItems: 2,
    hint: "De qué es responsable la persona en su día a día",
  },
  {
    key: "procesos",
    label: "Procesos",
    required: true,
    minItems: 2,
    hint: "Procesos concretos que ejecuta, con frecuencia y duración aproximada",
  },
  {
    key: "dolores",
    label: "Dolores",
    required: true,
    minItems: 2,
    hint: "Qué le hace perder tiempo, qué se rompe, qué le genera reprocesos",
  },
  {
    key: "herramientas",
    label: "Herramientas",
    required: true,
    minItems: 1,
    hint: "Software y sistemas que usa, y qué tan conforme está con ellos",
  },
  {
    key: "urgencia",
    label: "Urgencia",
    required: true,
    hint: "Qué tan apremiante es resolver estos problemas",
  },
  {
    key: "volumen",
    label: "Volumen",
    required: false,
    minItems: 1,
    hint: "Cifras concretas: cuántos casos, pedidos o solicitudes por periodo",
  },
  {
    key: "personasInvolucradas",
    label: "Personas involucradas",
    required: false,
    hint: "Cuánta gente participa en estos procesos",
  },
  {
    key: "kpis",
    label: "Indicadores",
    required: false,
    minItems: 1,
    hint: "Cómo se mide el éxito del área",
  },
  {
    key: "intentosPrevios",
    label: "Intentos previos",
    required: false,
    minItems: 1,
    hint: "Qué han intentado antes para resolverlo y por qué no funcionó",
  },
  {
    key: "citasTextuales",
    label: "Citas textuales",
    required: false,
    minItems: 1,
    hint: "Frases literales que capturen bien el problema",
  },
];

export interface MissingField {
  key: FichaFieldKey;
  label: string;
  hint: string;
}

/** Esquema de salida estructurada para Gemini (`generationConfig.responseSchema`). */
export const FICHA_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    responsabilidades: { type: "ARRAY", items: { type: "STRING" } },
    procesos: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING" },
          frecuencia: { type: "STRING" },
          duracionAprox: { type: "STRING" },
          manual: { type: "BOOLEAN" },
        },
        required: ["nombre"],
      },
    },
    dolores: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          descripcion: { type: "STRING" },
          impacto: { type: "STRING", enum: ["alto", "medio", "bajo"] },
          frecuencia: { type: "STRING" },
        },
        required: ["descripcion"],
      },
    },
    herramientas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING" },
          usoPrincipal: { type: "STRING" },
          satisfaccion: { type: "STRING" },
        },
        required: ["nombre"],
      },
    },
    volumen: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          metrica: { type: "STRING" },
          valor: { type: "STRING" },
          periodo: { type: "STRING" },
        },
        required: ["metrica", "valor"],
      },
    },
    personasInvolucradas: { type: "NUMBER" },
    kpis: { type: "ARRAY", items: { type: "STRING" } },
    intentosPrevios: { type: "ARRAY", items: { type: "STRING" } },
    urgencia: { type: "STRING", enum: ["alta", "media", "baja"] },
    citasTextuales: { type: "ARRAY", items: { type: "STRING" } },
  },
} as const;

function isFilled(ficha: EntrevistaFicha, spec: FieldSpec): boolean {
  const value = ficha[spec.key];
  if (value == null) return false;
  if (Array.isArray(value)) return value.length >= (spec.minItems ?? 1);
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return true;
}

/** Campos requeridos aún sin cubrir, en orden de prioridad de indagación. */
export function computeMissing(ficha: EntrevistaFicha): MissingField[] {
  return FICHA_FIELDS.filter((spec) => spec.required && !isFilled(ficha, spec)).map((spec) => ({
    key: spec.key,
    label: spec.label,
    hint: spec.hint,
  }));
}

/**
 * Completitud 0-100. Los requeridos pesan el doble que los opcionales: la barra
 * refleja qué tan cerca está la entrevista de poder cerrarse, no cuántos campos hay.
 */
export function computeCompleteness(ficha: EntrevistaFicha): number {
  let total = 0;
  let earned = 0;
  for (const spec of FICHA_FIELDS) {
    const weight = spec.required ? 2 : 1;
    total += weight;
    if (isFilled(ficha, spec)) earned += weight;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

function dedupeStrings(prev: string[] = [], next: string[] = []): string[] {
  const seen = new Set(prev.map((s) => s.trim().toLowerCase()));
  const out = [...prev];
  for (const item of next) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

/**
 * Fusiona objetos de una lista usando `idKey` como identidad. Si el elemento ya
 * existe, sus campos vacíos se completan con los nuevos; los que ya tenían valor
 * se respetan. Así una respuesta ambigua nunca degrada un dato ya confirmado.
 */
function mergeObjectList<T extends object>(
  prev: T[] = [],
  next: T[] = [],
  idKey: keyof T
): T[] {
  const out = [...prev];
  const indexOf = new Map<string, number>();
  const idOf = (item: T) => String(item[idKey] ?? "").trim().toLowerCase();

  out.forEach((item, i) => {
    const id = idOf(item);
    if (id) indexOf.set(id, i);
  });

  for (const item of next) {
    const id = idOf(item);
    if (!id) continue;

    const existingIndex = indexOf.get(id);
    if (existingIndex === undefined) {
      indexOf.set(id, out.length);
      out.push(item);
      continue;
    }

    const merged = { ...out[existingIndex] } as Record<string, unknown>;
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      const current = merged[k];
      const currentEmpty =
        current == null || (typeof current === "string" && current.trim() === "");
      if (currentEmpty && v != null && v !== "") {
        merged[k] = v;
      }
    }
    out[existingIndex] = merged as T;
  }
  return out;
}

/**
 * Merge conservador entre la ficha acumulada y una extracción nueva.
 *
 * Regla central: el extractor **agrega o refina, nunca borra**. Un turno donde el
 * entrevistado divaga produce una extracción casi vacía, y sin esta regla esa
 * extracción vaciaría la ficha construida hasta ese momento.
 */
export function mergeFicha(prev: EntrevistaFicha, next: EntrevistaFicha): EntrevistaFicha {
  const merged: EntrevistaFicha = { ...prev };

  // Identidad: viene del setup, el extractor no la sobrescribe.
  merged.empresa = prev.empresa ?? next.empresa;
  merged.area = prev.area ?? next.area;
  merged.rol = prev.rol ?? next.rol;

  merged.responsabilidades = dedupeStrings(prev.responsabilidades, next.responsabilidades);
  merged.kpis = dedupeStrings(prev.kpis, next.kpis);
  merged.intentosPrevios = dedupeStrings(prev.intentosPrevios, next.intentosPrevios);
  merged.citasTextuales = dedupeStrings(prev.citasTextuales, next.citasTextuales);

  merged.procesos = mergeObjectList(prev.procesos, next.procesos, "nombre");
  merged.dolores = mergeObjectList(prev.dolores, next.dolores, "descripcion");
  merged.herramientas = mergeObjectList(prev.herramientas, next.herramientas, "nombre");
  merged.volumen = mergeObjectList(prev.volumen, next.volumen, "metrica");

  // Escalares: el valor nuevo solo entra si el anterior estaba vacío.
  merged.personasInvolucradas = prev.personasInvolucradas ?? next.personasInvolucradas;
  merged.urgencia = prev.urgencia ?? next.urgencia;

  return merged;
}

/** Ficha inicial a partir del setup, antes de que hable nadie. */
export function createFichaFromSetup(setup: EntrevistaSetup): EntrevistaFicha {
  return {
    empresa: setup.empresa.trim(),
    area: setup.area.trim(),
    rol: setup.rol.trim(),
  };
}
