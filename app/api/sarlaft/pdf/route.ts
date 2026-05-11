import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import type { SarlaftPackage } from "@/lib/sarlaft/schema";
import { buildSagrilaftHtml } from "@/lib/sarlaft/templates/sagrilaft";
import { buildFatcaCrsHtml } from "@/lib/sarlaft/templates/fatcaCrs";
import { buildVinculacionHtml } from "@/lib/sarlaft/templates/vinculacion";
import { computeMissingFields, hasMissingFields } from "@/lib/sarlaft/missingFields";

function cloudflarePdfUrl(accountId: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;
}

async function renderPdfWithCloudflare(
  accountId: string,
  token: string,
  html: string
): Promise<ArrayBuffer> {
  const res = await fetch(cloudflarePdfUrl(accountId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html,
      pdfOptions: {
        format: "a4",
        printBackground: true,
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Cloudflare PDF: ${res.status} ${t.slice(0, 500)}`);
  }
  return res.arrayBuffer();
}

const HTML_README = `Paquete de formularios (modo sin Cloudflare)
================================================

Este ZIP contiene las tres vistas HTML listas para imprimir o guardar como PDF desde el navegador:

1. Abrir cada archivo .html en Chrome o Edge.
2. Menú Imprimir (Ctrl+P) → Destino "Guardar como PDF".

Si tienes configuradas CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN,
el servidor generará PDF automáticos en lugar de esta carpeta HTML.
`;

function zipResponse(buffer: ArrayBuffer, filename: string) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function buildHtmlFallbackZip(html1: string, html2: string, html3: string): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file("00_LEEME.txt", HTML_README);
  zip.file("01_SAGRILAFT_SARLAFT.html", html1);
  zip.file("02_FATCA_CRS.html", html2);
  zip.file("03_Vinculacion_PJ.html", html3);
  return zip.generateAsync({ type: "arraybuffer" });
}

async function buildPdfZip(
  accountId: string,
  token: string,
  html1: string,
  html2: string,
  html3: string
): Promise<ArrayBuffer> {
  const [b1, b2, b3] = await Promise.all([
    renderPdfWithCloudflare(accountId, token, html1),
    renderPdfWithCloudflare(accountId, token, html2),
    renderPdfWithCloudflare(accountId, token, html3),
  ]);
  const zip = new JSZip();
  zip.file("01_SAGRILAFT_SARLAFT.pdf", b1, { binary: true });
  zip.file("02_FATCA_CRS.pdf", b2, { binary: true });
  zip.file("03_Vinculacion_PJ.pdf", b3, { binary: true });
  return zip.generateAsync({ type: "arraybuffer" });
}

export async function POST(request: NextRequest) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const canUseCloudflare = Boolean(accountId && token);

  let body: { package?: SarlaftPackage; skipValidation?: boolean };
  try {
    body = (await request.json()) as { package?: SarlaftPackage; skipValidation?: boolean };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const pkg = body.package;
  if (!pkg?.formulario_1 || !pkg?.formulario_2 || !pkg?.formulario_3) {
    return NextResponse.json({ error: "Falta el paquete de formularios" }, { status: 400 });
  }
  if (!body.skipValidation && hasMissingFields(pkg)) {
    return NextResponse.json(
      { error: "Hay campos obligatorios sin completar", missing: computeMissingFields(pkg) },
      { status: 400 }
    );
  }

  try {
    const html1 = buildSagrilaftHtml(pkg.formulario_1);
    const html2 = buildFatcaCrsHtml(pkg.formulario_2);
    const html3 = buildVinculacionHtml(pkg.formulario_3);

    if (canUseCloudflare && accountId && token) {
      try {
        const zipBuffer = await buildPdfZip(accountId, token, html1, html2, html3);
        const res = zipResponse(zipBuffer, "paquete_vinculacion_pdf.zip");
        res.headers.set("X-Sarlaft-Package", "pdf");
        return res;
      } catch (e) {
        console.warn("sarlaft/pdf: Cloudflare PDF falló, usando ZIP HTML:", e);
      }
    } else if (!canUseCloudflare) {
      console.warn(
        "sarlaft/pdf: sin CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN; generando ZIP con HTML (impresión a PDF manual)."
      );
    }

    const zipBuffer = await buildHtmlFallbackZip(html1, html2, html3);
    const res = zipResponse(zipBuffer, "paquete_vinculacion_html.zip");
    res.headers.set("X-Sarlaft-Package", "html-fallback");
    return res;
  } catch (e) {
    console.error("sarlaft/pdf error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
