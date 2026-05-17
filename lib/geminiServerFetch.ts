/**
 * Fetch hacia Gemini desde rutas Node. En redes con interceptación TLS (proxy/antivirus)
 * Node puede fallar con UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 *
 * Solución correcta: definir NODE_EXTRA_CA_CERTS apuntando al PEM del CA corporativo.
 *
 * Solo desarrollo: GEMINI_TLS_INSECURE=1 usa `https` nativo sin verificar certificado
 * solo para esa llamada (no uses en producción).
 */
import * as https from "node:https";
import { URL as NodeURL } from "node:url";

export async function geminiServerFetch(url: string, init: RequestInit): Promise<Response> {
  if (!shouldUseInsecureTls()) {
    return fetch(url, init);
  }

  // eslint-disable-next-line no-console -- aviso explícito en desarrollo
  console.warn(
    "[gemini] GEMINI_TLS_INSECURE está activo: las llamadas a Gemini omiten verificación TLS (solo desarrollo)."
  );

  return httpsRequestAsFetch(url, init, { rejectUnauthorized: false });
}

function shouldUseInsecureTls(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const v = process.env.GEMINI_TLS_INSECURE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function flattenHeaders(h: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(h)) {
    for (const [key, value] of h) {
      out[key] = value;
    }
    return out;
  }
  for (const [key, value] of Object.entries(h)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

async function bodyToString(body: BodyInit | null | undefined): Promise<string> {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return Buffer.from(body).toString("utf8");
  if (body instanceof ArrayBuffer) return Buffer.from(body).toString("utf8");
  if (typeof Blob !== "undefined" && body instanceof Blob) return await body.text();
  return Buffer.from(await new Response(body).arrayBuffer()).toString("utf8");
}

function httpsRequestAsFetch(
  urlStr: string,
  init: RequestInit,
  tls: { rejectUnauthorized: boolean }
): Promise<Response> {
  const url = new NodeURL(urlStr);
  return bodyToString(init.body).then(
    (bodyStr) =>
      new Promise<Response>((resolve, reject) => {
        const headers = flattenHeaders(init.headers);
        const lowerKeys = new Set(Object.keys(headers).map((k) => k.toLowerCase()));
        if (bodyStr.length > 0 && !lowerKeys.has("content-length")) {
          headers["Content-Length"] = String(Buffer.byteLength(bodyStr));
        }

        const req = https.request(
          {
            hostname: url.hostname,
            port: url.port || 443,
            path: `${url.pathname}${url.search}`,
            method: init.method ?? "GET",
            headers,
            agent: new https.Agent({ rejectUnauthorized: tls.rejectUnauthorized }),
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
              const raw = Buffer.concat(chunks);
              const outHeaders: Record<string, string> = {};
              for (const [k, v] of Object.entries(res.headers)) {
                if (v === undefined) continue;
                outHeaders[k] = Array.isArray(v) ? v.join(", ") : v;
              }
              resolve(
                new Response(new Uint8Array(raw), {
                  status: res.statusCode ?? 0,
                  statusText: res.statusMessage ?? "",
                  headers: outHeaders,
                })
              );
            });
          }
        );

        req.on("error", reject);
        if (bodyStr.length > 0) req.write(bodyStr);
        req.end();
      })
  );
}

/** Mensaje legible incluyendo cause encadenado (ej. errores TLS en fetch). */
export function geminiFetchErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  let m = err.message;
  const c = err.cause;
  if (c instanceof Error) m += ` — ${c.message}`;
  else if (c !== undefined) m += ` — ${String(c)}`;
  return m;
}

/** Mensaje orientativo cuando fetch falla por certificado. */
export function formatGeminiTlsHint(originalMessage: string): string {
  const lower = originalMessage.toLowerCase();
  const tlsIssue =
    lower.includes("unable to verify") ||
    lower.includes("leaf_signature") ||
    lower.includes("self signed") ||
    lower.includes("certificate") ||
    lower.includes("ssl") ||
    lower.includes("tls");
  if (!tlsIssue) return originalMessage;

  return `${originalMessage}

TLS / certificado: importa el PEM del CA corporativo con NODE_EXTRA_CA_CERTS, o en desarrollo únicamente pon GEMINI_TLS_INSECURE=1 en .env.local (no usar en producción).`;
}
