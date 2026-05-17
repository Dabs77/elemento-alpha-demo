"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  House,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import type { PdfPageVlmExtraction, PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { getPdfPageCountInBrowser, MAX_PDF_VLM_PAGES, renderPdfFileToPagePngBlobs } from "@/lib/client/renderPdfToPngInBrowser";

export function PdfVlmExtractor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageHint, setPdfPageHint] = useState<number | null>(null);
  const [pdfDigest, setPdfDigest] = useState<PdfVlmDigestResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const digestMarkdown = useMemo(() => pdfDigest?.fullMarkdown?.trim() ?? "", [pdfDigest]);

  const handlePickPdf = () => fileInputRef.current?.click();

  const handlePdfSelected = async (f: File | null) => {
    setPdfDigest(null);
    setError(null);
    setProgress(null);
    setPhaseLabel(null);
    if (!f || f.type !== "application/pdf") {
      setPdfFile(null);
      setPdfPageHint(null);
      return;
    }
    setPdfFile(f);
    try {
      const n = await getPdfPageCountInBrowser(f);
      setPdfPageHint(n);
    } catch {
      setPdfPageHint(null);
    }
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfPageHint(null);
    setPdfDigest(null);
    setError(null);
    setProgress(null);
    setPhaseLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runVlmDigest = async () => {
    if (!pdfFile) return;
    setError(null);
    setPdfDigest(null);
    setAnalyzing(true);
    setProgress(null);
    setPhaseLabel("Rasterizando PDF en el navegador…");
    try {
      const rendered = await renderPdfFileToPagePngBlobs(pdfFile);
      if (rendered.length === 0) {
        throw new Error("No se pudieron generar imágenes del PDF. Prueba otro archivo.");
      }
      const totalPagesInFile = rendered[0].totalPagesInFile;
      const total = rendered.length;
      setProgress({ done: 0, total });
      setPhaseLabel("Enviando cada página al modelo de visión…");

      const pages: PdfPageVlmExtraction[] = [];
      for (let i = 0; i < rendered.length; i++) {
        const { pageNumber, blob } = rendered[i];
        const fd = new FormData();
        fd.set("image", blob, `page-${pageNumber}.png`);
        fd.set("pageNumber", String(pageNumber));
        fd.set("totalPages", String(totalPagesInFile));
        fd.set("fileName", pdfFile.name);

        const res = await fetch("/api/extras/pdf-vlm/page", { method: "POST", body: fd });
        const json: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof json === "object" &&
            json !== null &&
            "error" in json &&
            typeof (json as { error: unknown }).error === "string"
              ? (json as { error: string }).error
              : `Error al analizar la página ${pageNumber}.`;
          throw new Error(msg);
        }
        const extraction =
          typeof json === "object" && json !== null && "extraction" in json
            ? (json as { extraction: PdfPageVlmExtraction }).extraction
            : null;
        if (!extraction || typeof extraction.pageNumber !== "number") {
          throw new Error(`Respuesta inválida del servidor (página ${pageNumber}).`);
        }
        pages.push(extraction);
        setProgress({ done: i + 1, total });
      }

      pages.sort((a, b) => a.pageNumber - b.pageNumber);
      const fullMarkdown = pages
        .map(
          (p) =>
            `## Página ${p.pageNumber} de ${totalPagesInFile}\n\n${p.markdownCompleto}\n\n---\n`
        )
        .join("\n");

      setPdfDigest({
        fileName: pdfFile.name,
        totalPagesInPdf: totalPagesInFile,
        pagesAnalyzed: pages.length,
        extractedAt: new Date().toISOString(),
        pages,
        fullMarkdown,
      });
      setPhaseLabel(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el análisis.");
      setPdfDigest(null);
      setPhaseLabel(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadDigestJson = useCallback(() => {
    if (!pdfDigest) return;
    const blob = new Blob([JSON.stringify(pdfDigest, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safe = pdfDigest.fileName.replace(/[^\w.-]+/g, "_").slice(0, 80);
    a.download = `${safe || "pdf"}-vlm-digest.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pdfDigest]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center h-9 px-0 text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al home
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-3 gap-1.5 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <House className="h-4 w-4" /> Home
        </Link>
      </div>

      <header>
        <p className="text-xs font-semibold text-[#6abf1a] uppercase tracking-wider mb-1">
          Herramienta extra · fuera del roadmap por fases
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight">
          PDF + modelo de visión
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-2xl">
          Sube un PDF: se rasteriza en tu navegador y cada página se envía a Gemini para extraer texto, tablas y descripciones detalladas de gráficos e imágenes informativas. No forma parte del onboarding ni de las demos por fase.
        </p>
      </header>

      <section className="rounded-lg border border-[#4a7c59]/25 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          aria-hidden
          onChange={(ev) => {
            const f = ev.target.files?.[0] ?? null;
            void handlePdfSelected(f);
          }}
        />
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">Archivo PDF</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Límite demo: hasta <span className="font-semibold text-[#1a1a1a]">{MAX_PDF_VLM_PAGES} páginas</span> analizadas por ejecución.
              {pdfPageHint !== null ? (
                <>
                  {" "}
                  Este archivo tiene <span className="font-semibold tabular-nums">{pdfPageHint}</span> página(s).
                  {pdfPageHint > MAX_PDF_VLM_PAGES ? (
                    <span className="text-amber-700 font-medium">
                      {" "}
                      Solo se procesarán las primeras {MAX_PDF_VLM_PAGES}.
                    </span>
                  ) : null}
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handlePickPdf} disabled={analyzing}>
            <Upload className="w-4 h-4" /> Elegir PDF
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-[#4a7c59] text-white hover:bg-[#3f6b4c] disabled:opacity-60"
            onClick={() => void runVlmDigest()}
            disabled={!pdfFile || analyzing}
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Extraer información con IA
          </Button>
          {pdfFile ? (
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-gray-500" onClick={clearPdf} disabled={analyzing}>
              <Trash2 className="w-4 h-4" /> Quitar
            </Button>
          ) : null}
        </div>

        {pdfFile ? (
          <p className="text-xs text-gray-700 truncate" title={pdfFile.name}>
            <span className="font-medium">{pdfFile.name}</span>
          </p>
        ) : null}

        {phaseLabel ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-[#6abf1a] shrink-0" />
            <span>{phaseLabel}</span>
          </div>
        ) : null}

        {progress ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Páginas enviadas al VLM</span>
              <span className="tabular-nums font-medium text-[#1a1a1a]">
                {progress.done} / {progress.total}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#BBE795] to-[#4a7c59] transition-[width] duration-200 ease-out"
                style={{
                  width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p> : null}
      </section>

      {pdfDigest ? (
        <section className="rounded-lg border border-[#BBE795]/45 bg-[#F0FEE6]/25 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#BBE795]/35 bg-white/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <FileText className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">Resultado</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  <span className="font-medium text-[#1a1a1a] truncate inline-block max-w-[min(280px,80vw)] align-bottom" title={pdfDigest.fileName}>
                    {pdfDigest.fileName}
                  </span>
                  {" · "}
                  <span className="tabular-nums">{pdfDigest.pagesAnalyzed}</span> página(s)
                  {pdfDigest.totalPagesInPdf > pdfDigest.pagesAnalyzed ? (
                    <span className="text-amber-800 font-medium">
                      {" "}
                      (PDF: {pdfDigest.totalPagesInPdf} págs.; se analizaron {pdfDigest.pagesAnalyzed}, máximo {MAX_PDF_VLM_PAGES}{" "}
                      por ejecución)
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={downloadDigestJson}>
              <Download className="w-4 h-4" /> Descargar JSON
            </Button>
          </div>
          <div className="max-h-[min(560px,62vh)] overflow-y-auto px-5 py-4 bg-white border-t border-[#BBE795]/20">
            {digestMarkdown ? (
              <div className="streamdown-chat max-w-none text-[13px] leading-relaxed [&_.streamdown]:text-[13px]">
                <Streamdown>{digestMarkdown}</Streamdown>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin contenido Markdown.</p>
            )}
          </div>
          <div className="px-5 py-3 bg-[#FAFAFA] border-t border-gray-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4a7c59] shrink-0 mt-0.5" aria-hidden />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              El JSON incluye por página campos estructurados (texto, tablas,{" "}
              <span className="font-medium text-[#1a1a1a]">elementosVisuales</span> para gráficos e imágenes).
            </p>
          </div>
        </section>
      ) : null}

      <p className="text-xs text-gray-400 leading-relaxed">
        Requiere clave Gemini en servidor (<span className="font-mono text-[11px]">GEMINI_API_KEY</span> u otra soportada).
        Si ves error de certificado TLS (<span className="font-mono text-[11px]">UNABLE_TO_VERIFY_LEAF_SIGNATURE</span>),
        usa <span className="font-mono text-[11px]">NODE_EXTRA_CA_CERTS</span> con el PEM del CA corporativo, o solo en desarrollo{" "}
        <span className="font-mono text-[11px]">GEMINI_TLS_INSECURE=1</span> en <span className="font-mono text-[11px]">.env.local</span>.
        El worker PDF.js se carga desde la red (unpkg).
      </p>
    </div>
  );
}
