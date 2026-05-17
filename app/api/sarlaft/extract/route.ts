import { NextRequest, NextResponse } from "next/server";
import { getGeminiServerApiKey } from "@/lib/geminiServerKey";
import { geminiServerFetch } from "@/lib/geminiServerFetch";
import * as XLSX from "xlsx";
import { deepMergeSarlaft, ensurePackageShape } from "@/lib/sarlaft/mergePackage";
import { computeMissingFields } from "@/lib/sarlaft/missingFields";
import {
  GEMINI_EXTRACT_SYSTEM,
  buildPerDocPrompt,
  detectScannedPdf,
  shouldRetryWithAggressiveOcr,
} from "@/lib/sarlaft/ocr";
import type { OcrReportItem } from "@/lib/sarlaft/ocrTypes";
import { buildTargets } from "@/lib/sarlaft/targets";
import { renderPdfToPngPages, type RenderedPage } from "@/lib/sarlaft/renderPdf";
import { createEmptyPackage, type SarlaftPackage } from "@/lib/sarlaft/schema";

export const runtime = "nodejs";

/** Vercel Pro: hasta 300s; Hobby se limita a 60s aunque declares más. */
export const maxDuration = 300;

const GEMINI_MODEL = "gemini-3.1-pro-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DOC_IDS = ["camara", "rut", "cedula", "accionaria", "estados", "renta", "sagrilaft"] as const;

const MAX_PDF_PAGES = 20;

type QueuedFile = { id: (typeof DOC_IDS)[number]; file: File };

function collectQueuedFiles(formData: FormData): QueuedFile[] {
  const queue: QueuedFile[] = [];
  for (const id of DOC_IDS) {
    const entries = formData.getAll(id);
    for (const entry of entries) {
      if (entry instanceof File && entry.size > 0) {
        queue.push({ id, file: entry });
      }
    }
  }
  return queue;
}

type PreparedDoc = {
  id: (typeof DOC_IDS)[number];
  name: string;
  buffer: Buffer;
  mimeType: string;
  kind: "excel" | "pdf-pages" | "pdf-raw" | "image";
  excelText: string | null;
  pages: RenderedPage[] | null;
  scanned: boolean;
  textLayerChars: number;
  pageCount: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiPart = any;

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  );
}

function isImageMime(mime: string, fileName: string): boolean {
  if (mime.startsWith("image/")) return true;
  const n = fileName.toLowerCase();
  return n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".webp");
}

function isPdfMime(mime: string, fileName: string): boolean {
  if (mime === "application/pdf") return true;
  return fileName.toLowerCase().endsWith(".pdf");
}

function guessMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}

function excelToText(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: "array" });
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    lines.push(`=== Hoja: ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    lines.push(XLSX.utils.sheet_to_csv(sheet, { blankrows: false }));
    lines.push("");
  }
  return lines.join("\n");
}

function stripJsonFences(s: string): string {
  let t = s.trim();
  if (t.startsWith("```json")) t = t.slice(7);
  else if (t.startsWith("```")) t = t.slice(3);
  t = t.trim();
  if (t.endsWith("```")) t = t.slice(0, -3).trim();
  return t;
}

function parseGeminiJson(raw: string): unknown {
  if (!raw || !raw.trim()) {
    throw new Error("Respuesta de IA vacía.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(stripJsonFences(raw));
    } catch {
      throw new Error("Respuesta de IA no es JSON válido.");
    }
  }
}

async function callGeminiJson(parts: GeminiPart[], apiKey: string, temperature: number): Promise<unknown> {
  const res = await geminiServerFetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      systemInstruction: {
        parts: [{ text: GEMINI_EXTRACT_SYSTEM }],
      },
      generationConfig: {
        temperature,
        maxOutputTokens: 16384,
        topP: 0.85,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 400)}`);
  }
  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return parseGeminiJson(raw);
}

function financialHint(text?: string): string | null {
  if (!text?.trim()) return null;
  return `Nota externa del usuario (contexto financiero). Úsala SOLO si coincide con lo visible en este documento; no rellenes campos ausentes con esto:\n${text}`;
}

async function prepareOneDoc(
  id: (typeof DOC_IDS)[number],
  f: File
): Promise<PreparedDoc | null> {
  if (!f || f.size === 0) return null;
  const arrayBuffer = await f.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = f.name;
  const mime = guessMimeType(f);

  if (isExcelFile(f)) {
    return {
      id,
      name,
      buffer,
      mimeType: mime,
      kind: "excel",
      excelText: excelToText(arrayBuffer),
      pages: null,
      scanned: false,
      textLayerChars: 0,
      pageCount: 1,
    };
  }

  if (isPdfMime(mime, name)) {
    const { scanned, chars, pages: numPages } = await detectScannedPdf(buffer);
    try {
      const pages = await renderPdfToPngPages(buffer, { maxPages: MAX_PDF_PAGES, scale: 2 });
      if (pages.length > 0) {
        return {
          id,
          name,
          buffer,
          mimeType: "application/pdf",
          kind: "pdf-pages",
          excelText: null,
          pages,
          scanned,
          textLayerChars: chars,
          pageCount: pages.length,
        };
      }
    } catch (err) {
      console.warn(`[sarlaft] render PDF→PNG falló para ${id} (${name}):`, err instanceof Error ? err.message : err);
    }
    return {
      id,
      name,
      buffer,
      mimeType: "application/pdf",
      kind: "pdf-raw",
      excelText: null,
      pages: null,
      scanned,
      textLayerChars: chars,
      pageCount: Math.max(1, numPages || 1),
    };
  }

  if (isImageMime(mime, name)) {
    return {
      id,
      name,
      buffer,
      mimeType: mime.startsWith("image/") ? mime : "image/png",
      kind: "image",
      excelText: null,
      pages: null,
      scanned: true,
      textLayerChars: 0,
      pageCount: 1,
    };
  }

  return {
    id,
    name,
    buffer,
    mimeType: mime,
    kind: "image",
    excelText: null,
    pages: null,
    scanned: true,
    textLayerChars: 0,
    pageCount: 1,
  };
}

function docDataParts(doc: PreparedDoc): GeminiPart[] {
  if (doc.kind === "excel") {
    return [{ text: `[${doc.id}: ${doc.name} — Excel, contenido en texto]\n${doc.excelText}` }];
  }
  if (doc.kind === "pdf-pages" && doc.pages?.length) {
    const parts: GeminiPart[] = [];
    doc.pages.forEach((p) => {
      parts.push({ text: `— Página ${p.index} de ${doc.pages!.length} (imagen) —` });
      parts.push({ inlineData: { mimeType: p.mimeType, data: p.buffer.toString("base64") } });
    });
    return parts;
  }
  // pdf-raw o image: un único inlineData con el archivo completo
  return [
    { inlineData: { mimeType: doc.mimeType, data: doc.buffer.toString("base64") } },
  ];
}

async function extractOneDoc(
  doc: PreparedDoc,
  apiKey: string,
  currentMerged: SarlaftPackage,
  financialSummary: string | undefined
): Promise<{ partial: Partial<SarlaftPackage>; report: OcrReportItem }> {
  const dataParts = docDataParts(doc);
  const financial = financialHint(financialSummary);

  const targets = buildTargets(currentMerged);
  const currentJson = JSON.stringify(currentMerged, null, 2);

  const promptText = buildPerDocPrompt({
    docId: doc.id,
    docName: doc.name,
    pageCount: doc.pageCount,
    targets,
    currentPartialJson: currentJson,
    scanned: doc.kind !== "excel" && doc.scanned,
    aggressive: false,
  });

  const parts1: GeminiPart[] = [];
  if (financial) parts1.push({ text: financial });
  parts1.push(...dataParts);
  parts1.push({ text: promptText });

  let ocrUsed = doc.kind !== "excel" && doc.scanned;
  let ocrRetried = false;

  const parsed1 = (await callGeminiJson(parts1, apiKey, 0.1)) as Partial<SarlaftPackage> | null;
  let partial: Partial<SarlaftPackage> =
    typeof parsed1 === "object" && parsed1 ? (parsed1 as Partial<SarlaftPackage>) : {};

  if (shouldRetryWithAggressiveOcr(partial, doc.scanned)) {
    ocrRetried = true;
    ocrUsed = true;
    const aggressivePrompt = buildPerDocPrompt({
      docId: doc.id,
      docName: doc.name,
      pageCount: doc.pageCount,
      targets,
      currentPartialJson: currentJson,
      scanned: true,
      aggressive: true,
    });
    const parts2: GeminiPart[] = [];
    if (financial) parts2.push({ text: financial });
    parts2.push(...dataParts);
    parts2.push({ text: aggressivePrompt });
    const parsed2 = (await callGeminiJson(parts2, apiKey, 0)) as Partial<SarlaftPackage> | null;
    partial = typeof parsed2 === "object" && parsed2 ? (parsed2 as Partial<SarlaftPackage>) : {};
  }

  return {
    partial,
    report: {
      docId: doc.id,
      fileName: doc.name,
      scanned: doc.scanned,
      ocrUsed,
      ocrRetried,
      textLayerChars: doc.textLayerChars,
    },
  };
}

export async function POST(request: NextRequest) {
  const apiKey = getGeminiServerApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Sin clave de Gemini en el servidor. En Vercel define GEMINI_API_KEY o NEXT_PUBLIC_GEMINI_API_KEY (Settings → Environment Variables).",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const financialSummary = (formData.get("financialSummary") as string) || undefined;
    const queue = collectQueuedFiles(formData);

    if (queue.length === 0) {
      return NextResponse.json(
        { error: "No se recibió ningún documento. Sube al menos un archivo." },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const total = queue.length;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (obj: object) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
        };
        try {
          send({ type: "status", phase: "start", total, message: "Iniciando análisis por documento…" });

          const ocrReport: OcrReportItem[] = [];
          let merged = createEmptyPackage();

          for (let i = 0; i < queue.length; i++) {
            const q = queue[i];
            send({
              type: "status",
              phase: "preparing",
              docId: q.id,
              fileName: q.file.name,
              index: i + 1,
              total,
            });

            const d = await prepareOneDoc(q.id, q.file);
            if (!d) {
              send({
                type: "error",
                message: `No se pudo preparar el archivo: ${q.file.name}`,
              });
              controller.close();
              return;
            }

            const pendingCount = buildTargets(merged).length;
            send({
              type: "doc_start",
              docId: d.id,
              fileName: d.name,
              index: i + 1,
              total,
              pageCount: d.pageCount,
              kind: d.kind,
              pendingCount,
            });

            const { partial, report } = await extractOneDoc(d, apiKey, merged, financialSummary);
            ocrReport.push(report);
            merged = ensurePackageShape(deepMergeSarlaft(merged, partial));

            send({
              type: "doc_done",
              docId: d.id,
              pendingCount: buildTargets(merged).length,
            });
          }

          const missing = computeMissingFields(merged);
          send({ type: "complete", package: merged, missing, ocrReport });
          controller.close();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Error al extraer";
          send({ type: "error", message: msg });
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("sarlaft/extract error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
