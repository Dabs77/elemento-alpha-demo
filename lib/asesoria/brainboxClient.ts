/**
 * Cliente BrainBox API v1
 * Basado en la guía oficial de integración BrainBox × Alliance / QBox
 * 
 * Base URL: https://app.brainbox.com.co
 * Prefijo endpoints: /api/public/v1
 * Autenticación: Bearer token
 */

import { geminiServerFetch } from "@/lib/geminiServerFetch";

const DEFAULT_BASE_URL = "https://app.brainbox.com.co";
const API_PREFIX = "/api/public/v1";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BrainboxRole = "viewer" | "editor" | "admin" | "owner";

export type BrainboxConfig = {
  apiKey: string;
  boxId: string;
  fileIds?: string[];
  baseUrl: string;
};

export type BrainboxErrorPayload = {
  code?: string;
  category?: string;
  summary?: string;
  cause?: string;
};

export class BrainboxApiError extends Error {
  readonly code?: string;
  readonly category?: string;
  readonly status?: number;

  constructor(
    message: string,
    opts?: { code?: string; category?: string; status?: number }
  ) {
    super(message);
    this.name = "BrainboxApiError";
    this.code = opts?.code;
    this.category = opts?.category;
    this.status = opts?.status;
  }

  get isRateLimited(): boolean {
    return this.code === "B1009" || this.status === 429;
  }

  get isQuotaExhausted(): boolean {
    return this.code === "B3107";
  }

  get isAuthError(): boolean {
    return this.code === "B3002" || this.status === 403;
  }

  get isNotFound(): boolean {
    return this.code === "B1002" || this.status === 404;
  }
}

export type BrainboxFileMeta = {
  fileId: string;
  name: string;
  mediaType: string;
  storageSize: number;
  pages?: number;
  charCount?: number;
  createdAt?: string;
  tags?: string[];
  link?: string;
};

export type BrainboxRetrieveDocumentsResult = {
  query: string;
  documents: BrainboxRetrievedChunk[];
  usage?: { intelligence_units_consumed?: number };
  raw: unknown;
};

export type BrainboxRetrievedChunk = {
  text: string;
  page: number;
  fileName: string;
  fileId: string;
  source?: string;
  link?: string;
  score?: number;
};

export type BrainboxChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type BrainboxChatModel = "default" | "precise" | "pro" | "teacher" | "auto";

export type BrainboxChatCompletionResult = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type BrainboxBoxInfo = {
  box_id: string;
  name: string;
  workspace_id?: string;
  created_at?: string;
};

export type BrainboxAclMember = {
  user_id?: string;
  email: string;
  role: BrainboxRole;
};

export type BrainboxAclInfo = {
  users: BrainboxAclMember[];
  publicUsersCount: number;
  pendingInvitations: Array<{
    id: string;
    email: string;
    role: BrainboxRole;
    created_at: string;
  }>;
  publicLink?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Timeouts (según documentación oficial)
// ─────────────────────────────────────────────────────────────────────────────

const TIMEOUTS = {
  default: 60_000,        // 60s para endpoints básicos
  files: 60_000,          // 60s para listar archivos
  retrieve: 120_000,      // 120s para retrieval semántico
  chat: 180_000,          // 180s para chat completions
  upload: 600_000,        // 600s (10 min) para upload de archivos
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Configuration helpers (compatibilidad con implementación anterior)
// ─────────────────────────────────────────────────────────────────────────────

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

export function isBrainboxRagEnabled(): boolean {
  const provider = process.env.FUND_ADVISORY_RAG_PROVIDER?.trim().toLowerCase();
  if (provider === "local") return false;
  if (provider === "brainbox") {
    const cfg = getBrainboxConfig();
    if (!cfg) {
      throw new BrainboxApiError(
        "FUND_ADVISORY_RAG_PROVIDER=brainbox pero faltan BRAINBOX_API_KEY o BRAINBOX_BOX_ID"
      );
    }
    return true;
  }
  return getBrainboxConfig() !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BrainBox Client Class
// ─────────────────────────────────────────────────────────────────────────────

export type BrainboxClientOptions = {
  apiKey: string;
  baseUrl?: string;
  defaultTimeoutMs?: number;
};

export class BrainboxClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeoutMs: number;

  constructor(opts: BrainboxClientOptions) {
    if (!opts.apiKey) throw new Error("BRAINBOX_API_KEY is required");
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.defaultTimeoutMs = opts.defaultTimeoutMs ?? TIMEOUTS.default;
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    opts: { body?: unknown; timeoutMs?: number; stream?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${path}`;

    try {
      const res = await geminiServerFetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: opts.stream ? "text/event-stream" : "application/json",
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
      });

      if (opts.stream) {
        if (!res.ok) throw await this.buildError(res);
        return res as unknown as T;
      }

      const json = (await res.json()) as
        | { success: true; data: T }
        | { success: false; error: BrainboxErrorPayload };

      if (!res.ok || !("success" in json) || json.success === false) {
        const errPayload =
          ("success" in json && json.success === false && json.error) ||
          ({ code: "UNKNOWN", cause: "Unknown BrainBox error" } as BrainboxErrorPayload);
        throw new BrainboxApiError(
          `BrainBox API (${errPayload.code ?? res.status}): ${errPayload.summary ?? res.statusText}${errPayload.cause ? ` — ${errPayload.cause}` : ""}`,
          { code: errPayload.code, category: errPayload.category, status: res.status }
        );
      }

      return json.data;
    } catch (err) {
      if (err instanceof BrainboxApiError) throw err;
      throw new BrainboxApiError(
        `BrainBox fetch error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private async buildError(res: Response): Promise<BrainboxApiError> {
    let payload: BrainboxErrorPayload = { code: "UNKNOWN" };
    try {
      const j = await res.json();
      if (j?.error) payload = j.error;
    } catch {}
    return new BrainboxApiError(
      `BrainBox API (${payload.code ?? res.status}): ${payload.summary ?? res.statusText}${payload.cause ? ` — ${payload.cause}` : ""}`,
      { code: payload.code, category: payload.category, status: res.status }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────────────────────────────────────

  async ping(): Promise<{ message: string }> {
    return this.request<{ message: string }>("GET", "/check");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Boxes CRUD
  // ─────────────────────────────────────────────────────────────────────────

  async createBox(input: {
    name: string;
    users?: Array<{ email: string; role: BrainboxRole }>;
    fileIds?: string[];
    workspaceId?: string | null;
    notify?: boolean;
  }): Promise<{ box_id: string; name: string; workspace_id?: string; members?: unknown[]; invitationsSent?: string[] }> {
    return this.request("POST", "/boxes", { body: input });
  }

  async listBoxes(params?: {
    page?: number;
    limit?: number;
    query?: string;
    sort?: "asc" | "desc";
    tags?: string;
    workspaceId?: string;
  }): Promise<{ boxes: BrainboxBoxInfo[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.query) queryParams.set("query", params.query);
    if (params?.sort) queryParams.set("sort", params.sort);
    if (params?.tags) queryParams.set("tags", params.tags);
    if (params?.workspaceId) queryParams.set("workspaceId", params.workspaceId);
    const qs = queryParams.toString();
    return this.request("GET", `/boxes${qs ? `?${qs}` : ""}`);
  }

  async getBox(boxId: string): Promise<{ box: BrainboxBoxInfo; role: string }> {
    return this.request("GET", `/boxes/${boxId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // File Upload & Management
  // ─────────────────────────────────────────────────────────────────────────

  async uploadFromUrl(
    boxId: string,
    input: { url: string; fileName?: string }
  ): Promise<{
    file_id: string;
    name: string;
    media_type: string;
    storage_size: number;
    box_id: string;
  }> {
    return this.request("POST", `/boxes/${boxId}/upload`, {
      body: input,
      timeoutMs: TIMEOUTS.upload,
    });
  }

  async listFiles(boxId: string): Promise<{ files: BrainboxFileMeta[]; usage: { files: number } }> {
    return this.request("GET", `/boxes/${boxId}/files`, { timeoutMs: TIMEOUTS.files });
  }

  async getSignedUrl(fileId: string): Promise<{
    name: string;
    mediaType: string;
    signedUrl: string;
    expiresIn: number;
  }> {
    return this.request("GET", `/files/${fileId}/signed-url`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Retrieval (RAG)
  // ─────────────────────────────────────────────────────────────────────────

  async retrieveDocuments(
    boxId: string,
    input: { query: string; sources?: string[]; threshold?: number }
  ): Promise<BrainboxRetrieveDocumentsResult> {
    console.log(`[brainbox] Query: ${input.query}`);

    const data = await this.request<Record<string, unknown>>(
      "POST",
      `/boxes/${boxId}/retrieve-documents`,
      { body: input, timeoutMs: TIMEOUTS.retrieve }
    );

    const chunks = this.flattenRetrieveDocumentsPayload(data);

    console.log(`[brainbox] Retrieval: ${chunks.length} fragmento(s)`);
    chunks.forEach((c, i) => {
      const scoreStr = c.score !== undefined ? ` (score: ${c.score.toFixed(3)})` : "";
      const preview = c.text.slice(0, 200).replace(/\s+/g, " ").trim();
      console.log(`  [${i + 1}] ${c.fileName} p.${c.page ?? "?"}${scoreStr}`);
      console.log(`      ${preview}${c.text.length > 200 ? "..." : ""}`);
    });

    return {
      query: input.query,
      documents: chunks,
      usage: data.usage as BrainboxRetrieveDocumentsResult["usage"],
      raw: data,
    };
  }

  async retrieveFullDocuments(
    boxId: string,
    sources: string[]
  ): Promise<{
    documents: Array<{ fileName: string; pages: Array<{ page: number; text: string }> }>;
    usage: { documents_retrieved: number; total_pages: number };
  }> {
    return this.request("POST", `/boxes/${boxId}/retrieve-full-documents`, {
      body: { sources },
      timeoutMs: TIMEOUTS.retrieve,
    });
  }

  private flattenRetrieveDocumentsPayload(data: unknown): BrainboxRetrievedChunk[] {
    if (!data || typeof data !== "object") return [];
    const root = data as Record<string, unknown>;

    const rawDocs: unknown[] = [];

    if (Array.isArray(root.documents)) {
      for (const group of root.documents) {
        if (!group || typeof group !== "object") {
          rawDocs.push(group);
          continue;
        }
        const g = group as Record<string, unknown>;
        if (Array.isArray(g.documents)) {
          rawDocs.push(...g.documents);
        } else {
          rawDocs.push(group);
        }
      }
    } else if (Array.isArray(root.chunks)) {
      rawDocs.push(...root.chunks);
    } else if (Array.isArray(root.results)) {
      rawDocs.push(...root.results);
    }

    return rawDocs
      .filter((doc): doc is Record<string, unknown> => doc !== null && typeof doc === "object")
      .map((doc) => ({
        text: String(doc.text || doc.content || doc.passage || ""),
        page: Number(doc.page || doc.pageNumber || doc.page_number || 0),
        fileName: String(doc.fileName || doc.file_name || doc.documentName || "documento"),
        fileId: String(doc.fileId || doc.file_id || ""),
        source: doc.source as string | undefined,
        link: doc.link as string | undefined,
        score: typeof doc.score === "number" ? doc.score : undefined,
      }))
      .filter((chunk) => chunk.text.trim().length > 0);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chat Completions (OpenAI-compatible)
  // ─────────────────────────────────────────────────────────────────────────

  async chat(
    boxId: string,
    input: {
      messages: BrainboxChatMessage[];
      model?: BrainboxChatModel;
      temperature?: number;
      source_file_ids?: string[];
      full_context?: boolean;
      threshold?: number;
      max_sources?: number;
    }
  ): Promise<BrainboxChatCompletionResult> {
    return this.request("POST", `/boxes/${boxId}/chat/completions`, {
      body: { ...input, stream: false },
      timeoutMs: TIMEOUTS.chat,
    });
  }

  async chatStream(
    boxId: string,
    input: Parameters<BrainboxClient["chat"]>[1]
  ): Promise<Response> {
    return this.request("POST", `/boxes/${boxId}/chat/completions`, {
      body: { ...input, stream: true },
      stream: true,
      timeoutMs: TIMEOUTS.chat,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACL (Access Control)
  // ─────────────────────────────────────────────────────────────────────────

  async getAcl(boxId: string): Promise<BrainboxAclInfo> {
    return this.request("GET", `/boxes/${boxId}/acl`);
  }

  async replaceAcl(
    boxId: string,
    input: { users: Array<{ email: string; role: BrainboxRole }>; notify?: boolean }
  ): Promise<unknown> {
    return this.request("PATCH", `/boxes/${boxId}/acl`, { body: input });
  }

  async addMember(
    boxId: string,
    input: { email: string; role: BrainboxRole; notify?: boolean }
  ): Promise<unknown> {
    return this.request("POST", `/boxes/${boxId}/acl/members`, { body: input });
  }

  async updateMemberRole(
    boxId: string,
    email: string,
    role: BrainboxRole,
    notify = false
  ): Promise<unknown> {
    return this.request("PATCH", `/boxes/${boxId}/acl/members/${encodeURIComponent(email)}`, {
      body: { role, notify },
    });
  }

  async removeMember(boxId: string, email: string): Promise<unknown> {
    return this.request("DELETE", `/boxes/${boxId}/acl/members/${encodeURIComponent(email)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton client instance (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

let _clientInstance: BrainboxClient | null = null;

export function getBrainboxClient(): BrainboxClient | null {
  if (_clientInstance) return _clientInstance;
  const cfg = getBrainboxConfig();
  if (!cfg) return null;
  _clientInstance = new BrainboxClient({
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
  });
  return _clientInstance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy API (backward compatibility with existing code)
// ─────────────────────────────────────────────────────────────────────────────

export async function brainboxHealthCheck(cfg?: BrainboxConfig): Promise<unknown> {
  const client = cfg
    ? new BrainboxClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl })
    : getBrainboxClient();
  if (!client) throw new BrainboxApiError("BrainBox no configurado");
  return client.ping();
}

export async function brainboxRetrieveDocuments(
  query: string,
  opts?: { sources?: string[]; threshold?: number; cfg?: BrainboxConfig }
): Promise<BrainboxRetrieveDocumentsResult> {
  const cfg = opts?.cfg ?? getBrainboxConfig();
  if (!cfg) throw new BrainboxApiError("BrainBox no configurado");

  const client = new BrainboxClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl });
  return client.retrieveDocuments(cfg.boxId, {
    query: query.trim(),
    sources: opts?.sources ?? cfg.fileIds,
    threshold: opts?.threshold,
  });
}

export async function brainboxListFiles(cfg?: BrainboxConfig): Promise<BrainboxFileMeta[]> {
  const resolved = cfg ?? getBrainboxConfig();
  if (!resolved) throw new BrainboxApiError("BrainBox no configurado");

  const client = new BrainboxClient({ apiKey: resolved.apiKey, baseUrl: resolved.baseUrl });
  const result = await client.listFiles(resolved.boxId);
  return result.files;
}

export async function brainboxChat(
  messages: BrainboxChatMessage[],
  opts?: {
    model?: BrainboxChatModel;
    temperature?: number;
    source_file_ids?: string[];
    cfg?: BrainboxConfig;
  }
): Promise<BrainboxChatCompletionResult> {
  const cfg = opts?.cfg ?? getBrainboxConfig();
  if (!cfg) throw new BrainboxApiError("BrainBox no configurado");

  const client = new BrainboxClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl });
  return client.chat(cfg.boxId, {
    messages,
    model: opts?.model ?? "default",
    temperature: opts?.temperature,
    source_file_ids: opts?.source_file_ids ?? cfg.fileIds,
  });
}

export async function brainboxExtractJson<T>(
  schema: string,
  prompt: string,
  opts?: { cfg?: BrainboxConfig }
): Promise<T> {
  const cfg = opts?.cfg ?? getBrainboxConfig();
  if (!cfg) throw new BrainboxApiError("BrainBox no configurado");

  const client = new BrainboxClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl });
  const result = await client.chat(cfg.boxId, {
    model: "pro",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: [
          "Eres un extractor determinístico de documentos.",
          "Responde EXCLUSIVAMENTE con un objeto JSON válido que respete el schema provisto.",
          "No incluyas texto fuera del JSON. No uses bloques de código markdown.",
          "Si un campo no aparece en los documentos, ponlo en null.",
          `Schema: ${schema}`,
        ].join("\n"),
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = result.choices[0]?.message?.content ?? "";
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new BrainboxApiError(`BrainBox returned invalid JSON: ${raw.slice(0, 200)}...`, {
      code: "INVALID_JSON",
    });
  }
}
