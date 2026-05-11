import type { SarlaftPackage } from "@/lib/sarlaft/schema";

function filenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  const utf8 = cd.match(/filename\*=UTF-8''([^;]+)/i);
  const quoted = cd.match(/filename="([^"]+)"/i);
  const plain = cd.match(/filename=([^;\s]+)/i);
  const raw = utf8?.[1]?.trim() ?? quoted?.[1]?.trim() ?? plain?.[1]?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Solicita ZIP de formularios (PDF vía Cloudflare si hay credenciales; si no, HTML + LEEME).
 */
export async function fetchSarlaftPackageZip(
  pkg: SarlaftPackage,
  opts?: { skipValidation?: boolean }
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch("/api/sarlaft/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: pkg,
      ...(opts?.skipValidation ? { skipValidation: true } : {}),
    }),
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let message = `Error ${res.status}`;
    if (contentType.includes("application/json")) {
      try {
        const j = (await res.json()) as { error?: string };
        if (typeof j?.error === "string" && j.error.trim()) message = j.error.trim();
      } catch {
        /* ignore */
      }
    }
    throw new Error(message);
  }

  if (!contentType.includes("application/zip") && !contentType.includes("application/octet-stream")) {
    throw new Error("El servidor no devolvió un ZIP válido.");
  }

  const blob = await res.blob();
  const filename =
    filenameFromContentDisposition(res.headers.get("content-disposition")) ?? "sarlaft-formularios.zip";

  return { blob, filename };
}
