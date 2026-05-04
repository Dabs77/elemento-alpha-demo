import type { CicloEmpresa, ExperienciaInversion, Liquidez, SarlaftPackage, ToleranciaRiesgo, VinculacionForm } from "./schema";

/** Valores exactos del formulario 3 (perfil de inversión) — deben coincidir con el esquema SARLAFT. */
export const SARLAFT_INTERVIEW_CICLO: readonly CicloEmpresa[] = [
  "Joven/Crecimiento",
  "Trayectoria/Rentabilizar",
  "Madura/Optimización tributaria",
];

export const SARLAFT_INTERVIEW_LIQUIDEZ: readonly Liquidez[] = [
  "Muy relevante",
  "Algo relevante",
  "Nada relevante",
];

export const SARLAFT_INTERVIEW_EXPERIENCIA: readonly ExperienciaInversion[] = [
  "Cuentas/CDT",
  "Fondos de Inversión",
  "Bonos/Acciones",
  "Derivados/Capital Privado",
];

export const SARLAFT_INTERVIEW_TOLERANCIA: readonly ToleranciaRiesgo[] = [
  "Retirar todo",
  "Retirar parte",
  "Esperar/Invertir más aprovechando precios bajos",
];

export type SarlaftInterviewProfileFields = Pick<
  VinculacionForm,
  "ciclo_empresa" | "liquidez" | "experiencia_inversion" | "tolerancia_riesgo"
>;

/** Perfil por defecto si la entrevista, el LLM u OCR no dejan valores válidos en el formulario 3. */
export const DEFAULT_INTERVIEW_SARLAFT_PROFILE: SarlaftInterviewProfileFields = {
  ciclo_empresa: "Joven/Crecimiento",
  liquidez: "Muy relevante",
  experiencia_inversion: "Cuentas/CDT",
  tolerancia_riesgo: "Esperar/Invertir más aprovechando precios bajos",
};

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/** Quita el bloque PORTFOLIO_JSON (con llaves balanceadas) para no distraer al modelo extractor. */
export function stripPortfolioJsonFromTranscript(text: string): string {
  const idx = text.indexOf("PORTFOLIO_JSON:");
  if (idx < 0) return text.trim();

  const scanFrom = idx + "PORTFOLIO_JSON:".length;
  const open = text.indexOf("{", scanFrom);
  if (open === -1) return (text.slice(0, idx) + text.slice(scanFrom)).trim();

  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) return text.trim();
  return (text.slice(0, idx) + text.slice(end)).replace(/\s{3,}/g, "\n\n").trim();
}

function pickFromList<T extends string>(raw: unknown, allowed: readonly T[]): T | undefined {
  if (typeof raw !== "string") return undefined;
  const t = norm(raw);
  return allowed.find((a) => a === t) ?? allowed.find((a) => a.toLowerCase() === t.toLowerCase());
}

/**
 * Valida y normaliza el JSON devuelto por el LLM.
 */
export function parseSarlaftInterviewProfileJson(raw: unknown): Partial<SarlaftInterviewProfileFields> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: Partial<SarlaftInterviewProfileFields> = {};

  const c = pickFromList(o.ciclo_empresa, SARLAFT_INTERVIEW_CICLO);
  if (c) out.ciclo_empresa = c;

  const l = pickFromList(o.liquidez, SARLAFT_INTERVIEW_LIQUIDEZ);
  if (l) out.liquidez = l;

  const e = pickFromList(o.experiencia_inversion, SARLAFT_INTERVIEW_EXPERIENCIA);
  if (e) out.experiencia_inversion = e;

  const tol = pickFromList(o.tolerancia_riesgo, SARLAFT_INTERVIEW_TOLERANCIA);
  if (tol) out.tolerancia_riesgo = tol;

  return out;
}

/** Aplica únicamente claves válidas; no borra valores si el extracto llega incompleto. */
export function applyLlmInterviewProfileToSarlaft(
  pkg: SarlaftPackage,
  profile: Partial<SarlaftInterviewProfileFields>
): SarlaftPackage {
  const next = clone(pkg);
  const f3 = next.formulario_3;

  if (profile.ciclo_empresa) f3.ciclo_empresa = profile.ciclo_empresa;
  if (profile.liquidez) f3.liquidez = profile.liquidez;
  if (profile.experiencia_inversion) f3.experiencia_inversion = profile.experiencia_inversion;
  if (profile.tolerancia_riesgo) f3.tolerancia_riesgo = profile.tolerancia_riesgo;

  return next;
}

/**
 * Rellena cada campo de perfil vacío o inválido (no coincide con el catálogo SARLAFT) con `DEFAULT_INTERVIEW_SARLAFT_PROFILE`.
 */
export function applyDefaultInterviewProfileWhereMissing(pkg: SarlaftPackage): SarlaftPackage {
  const next = clone(pkg);
  const f3 = next.formulario_3;
  const d = DEFAULT_INTERVIEW_SARLAFT_PROFILE;

  if (!pickFromList(f3.ciclo_empresa, SARLAFT_INTERVIEW_CICLO)) {
    f3.ciclo_empresa = d.ciclo_empresa;
  }
  if (!pickFromList(f3.liquidez, SARLAFT_INTERVIEW_LIQUIDEZ)) {
    f3.liquidez = d.liquidez;
  }
  if (!pickFromList(f3.experiencia_inversion, SARLAFT_INTERVIEW_EXPERIENCIA)) {
    f3.experiencia_inversion = d.experiencia_inversion;
  }
  if (!pickFromList(f3.tolerancia_riesgo, SARLAFT_INTERVIEW_TOLERANCIA)) {
    f3.tolerancia_riesgo = d.tolerancia_riesgo;
  }

  return next;
}
