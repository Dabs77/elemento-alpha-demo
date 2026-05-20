/**
 * Estado en runtime para el proveedor RAG.
 * Solo BrainBox está habilitado.
 */

export type RagProviderType = "brainbox";

/**
 * Obtiene el proveedor (siempre BrainBox).
 */
export function getRagProvider(): RagProviderType {
  return "brainbox";
}

/**
 * No-op: el proveedor siempre es BrainBox.
 */
export function setRagProvider(_provider: RagProviderType | null): void {
  console.log("[rag-provider] Proveedor fijo: brainbox");
}

/**
 * Info del estado del proveedor.
 */
export function getProviderInfo(): {
  current: RagProviderType;
  envDefault: RagProviderType;
  isOverridden: boolean;
} {
  return {
    current: "brainbox",
    envDefault: "brainbox",
    isOverridden: false,
  };
}

export const PROVIDER_LABELS: Record<RagProviderType, string> = {
  brainbox: "BrainBox (semántico)",
};

export const PROVIDER_DESCRIPTIONS: Record<RagProviderType, string> = {
  brainbox: "Búsqueda semántica + reranking con BrainBox API.",
};
