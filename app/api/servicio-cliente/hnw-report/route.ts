import { NextRequest, NextResponse } from "next/server";
import { buildHnwReportHtml } from "@/lib/servicio-cliente/hnwReportHtml";

function cloudflarePdfUrl(accountId: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;
}

async function renderPdfWithCloudflare(accountId: string, token: string, html: string): Promise<ArrayBuffer> {
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
        landscape: false,
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

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "html";
  const html = buildHnwReportHtml();

  if (format === "html") {
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (format !== "pdf") {
    return NextResponse.json({ error: "Usa format=html o format=pdf" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    return NextResponse.json(
      {
        error:
          "PDF remoto no configurado. Añade CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN, o usa format=html.",
      },
      { status: 503 }
    );
  }

  try {
    const pdf = await renderPdfWithCloudflare(accountId, token, html);
    const name = `elemento-alpha-informe-hnw-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("hnw-report pdf error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
