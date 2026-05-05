/**
 * Modelo REST para `generateContent` (texto / chat servidor).
 *
 * Identificador oficial: **gemini-3-flash-preview**
 * Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`
 *
 * @see https://ai.google.dev/gemini-api/docs/models
 * @see https://ai.google.dev/gemini-api/docs/text-generation
 */
export const GEMINI_3_FLASH_PREVIEW = "gemini-3-flash-preview" as const;

export function geminiGenerateContentUrl(
  modelId: string = GEMINI_3_FLASH_PREVIEW
): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
}
