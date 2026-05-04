/**
 * Clave de Gemini en rutas servidor. En Vercel a veces solo se define
 * NEXT_PUBLIC_GEMINI_API_KEY para el cliente Live; el extracción OCR usa la misma
 * clave en servidor. Preferir GEMINI_API_KEY (no expuesta al bundle del cliente).
 */
export function getGeminiServerApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ];
  for (const v of candidates) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}
