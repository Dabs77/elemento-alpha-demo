import { geminiFetchErrorMessage, geminiServerFetch } from "@/lib/geminiServerFetch";

const DEFAULT_BASE_URL = "https://app.brainbox.com.co/api/public/v1";

export type BrainboxConfig = {
  apiKey: string;
  boxId: string;
  fileIds?: string[];
  baseUrl: string;
};

export type BrainboxApiErrorBody = {
  code?: string;
  category?: string;
  summary?: string;
  cause?: string;
};

export class BrainboxApiError extends Error {
  readonly code?: string;
  readonly category?: string;
  readonly status?: number;

  constructor(message: string, opts?: { code?: string; category?: string; status?: number }) {
    super(message);
    this.name = "BrainboxApiError";
    this.code = opts?.code;
    this.category = opts?.category;
    this.status = opts?.status;
  }
}

export type BrainboxRetrieveDocumentsResult = {
  documents: unknown[];
  usage?: {
    intelligence_units_consumed?: number;
    intelligenceUnitsConsumed?: number;
  };
  raw: unknown;
};

export type BrainboxFileMeta = {
  id: string;
  fileName?: string;
};

function parseFileIds(raw: string | undefined): string[] | undefined {
  if (!raw?.trim()) return undefined;
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

export function getBrainboxConfig(): BrainboxConfig | null {
  const apiKey = process.env.BRAINBOX_API_KEY?.trim();
  const boxId = process.env.BRAINBOX_BOX_ID?.trim();
  if (!apiKey || !boxId) return null;

  return {
    apiKey,
    boxId,
    fileIds: parseFileIds(process.env.BRAINBOX_FILE_IDS),
    baseUrl: process.env.BRAINBOX_BASE_URL?.trim() || DEFAULT_BASE_URL,
  };
}

/** BrainBox activo si hay credenciales y no se fuerza proveedor local. */
export function isBrainboxRagEnabled(): boolean {
  const provider = process.env.FUND_ADVISORY_RAG_PROVIDER?.trim().toLowerCase();
  if (provider === "local") return false;
  if (provider === "brainbox") {
    const cfg = getBrainboxConfig();
    if (!cfg) {
      throw new BrainboxApiError(
        "FUND_ADVISORY_RAG_PROVIDER=brainbox pero faltan BRAINBOX_API_KEY o BRAINBOX_BOX_ID",
      );
    }
    return true;
  }
  return getBrainboxConfig() !== null;
}

async function brainboxRequest<T>(
  cfg: BrainboxConfig,
  method: "GET" | "POST",
  endpoint: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  let res: Response;
  try {
    res = await geminiServerFetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new BrainboxApiError(`BrainBox fetch: ${geminiFetchErrorMessage(err)}`);
  }

  let payload: { success?: boolean; data?: T; error?: BrainboxApiErrorBody } = {};
  try {
    payload = (await res.json()) as { success?: boolean; data?: T; error?: BrainboxApiErrorBody };
  } catch {
    payload = {};
  }

  if (!res.ok || payload?.success === false) {
    const err = payload?.error;
    throw new BrainboxApiError(
      `BrainBox API (${err?.code ?? res.status}): ${err?.summary ?? res.statusText}${err?.cause ? ` — ${err.cause}` : ""}`,
      { code: err?.code, category: err?.category, status: res.status },
    );
  }

  return (payload?.data ?? payload) as T;
}

export async function brainboxHealthCheck(cfg?: BrainboxConfig): Promise<unknown> {
  const resolved = cfg ?? getBrainboxConfig();
  if (!resolved) throw new BrainboxApiError("BrainBox no configurado");
  return brainboxRequest(resolved, "GET", "check");
}

function flattenRetrieveDocumentsPayload(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;

  if (Array.isArray(root.documents)) {
    const flat: unknown[] = [];
    for (const group of root.documents) {
      if (!group || typeof group !== "object") {
        flat.push(group);
        continue;
      }
      const g = group as Record<string, unknown>;
      if (Array.isArray(g.documents)) {
        flat.push(...g.documents);
        continue;
      }
      flat.push(group);
    }
    if (flat.length > 0) return flat;
  }

  if (Array.isArray(root.chunks)) return root.chunks;
  if (Array.isArray(root.results)) return root.results;
  if (Array.isArray(root.passages)) return root.passages;
  return [];
}

export async function brainboxRetrieveDocuments(
  query: string,
  opts?: { sources?: string[]; cfg?: BrainboxConfig },
): Promise<BrainboxRetrieveDocumentsResult> {
  const cfg = opts?.cfg ?? getBrainboxConfig();
  if (!cfg) throw new BrainboxApiError("BrainBox no configurado");

  const body: Record<string, unknown> = { query: query.trim() };
  const sources = opts?.sources ?? cfg.fileIds;
  if (sources?.length) body.sources = sources;

  const data = await brainboxRequest<Record<string, unknown>>(
    cfg,
    "POST",
    `boxes/${cfg.boxId}/retrieve-documents`,
    body,
  );

  return {
    documents: flattenRetrieveDocumentsPayload(data),
    usage: (data.usage as BrainboxRetrieveDocumentsResult["usage"]) ?? undefined,
    raw: data,
  };
}

export async function brainboxListFiles(cfg?: BrainboxConfig): Promise<BrainboxFileMeta[]> {
  const resolved = cfg ?? getBrainboxConfig();
  if (!resolved) throw new BrainboxApiError("BrainBox no configurado");

  const data = await brainboxRequest<unknown>(
    resolved,
    "GET",
    `boxes/${resolved.boxId}/files`,
  );

  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).files)
      ? ((data as Record<string, unknown>).files as unknown[])
      : [];

  const out: BrainboxFileMeta[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : typeof o.fileId === "string" ? o.fileId : null;
    if (!id) continue;
    const fileName =
      typeof o.fileName === "string"
        ? o.fileName
        : typeof o.name === "string"
          ? o.name
          : undefined;
    out.push({ id, fileName });
  }
  return out;
}
