"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  House,
  Loader2,
  Pause,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import type { PdfPageVlmExtraction, PdfVlmDigestResult } from "@/lib/onboarding/pdfVlmDigestTypes";
import { getPdfPageCountInBrowser, MAX_PDF_VLM_PAGES, renderPdfFileToPagePngBlobs } from "@/lib/client/renderPdfToPngInBrowser";

const STORAGE_KEY_PREFIX = "pdf-vlm-job-";
const MAX_PARALLEL_PAGES = 3;

type PageStatus = "pending" | "extracting" | "extracted" | "confirmed" | "error";

type PageData = {
  pageNumber: number;
  blob: Blob;
  blobUrl: string;
  extraction: PdfPageVlmExtraction | null;
  status: PageStatus;
  feedback: string;
  error?: string;
  maxTokens?: number;
  paraphraseMode?: boolean;
};

const TOKEN_OPTIONS = [
  { label: "64K (default)", value: 65536 },
  { label: "128K", value: 131072 },
  { label: "256K", value: 262144 },
];

type JobStatus = "queued" | "rasterizing" | "extracting" | "paused" | "completed" | "error";

type PdfJob = {
  id: string;
  file: File;
  fileName: string;
  status: JobStatus;
  pagesData: PageData[];
  totalPages: number;
  error?: string;
  abortController?: AbortController;
  shouldStop: boolean;
};

function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function saveJobToStorage(job: PdfJob) {
  const data = {
    id: job.id,
    fileName: job.fileName,
    status: job.status,
    totalPages: job.totalPages,
    extractions: job.pagesData
      .filter((p) => p.extraction !== null)
      .map((p) => ({
        pageNumber: p.pageNumber,
        extraction: p.extraction!,
        status: p.status,
      })),
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + job.id, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearJobFromStorage(jobId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + jobId);
  } catch {
    // ignore
  }
}

function getJobDigest(job: PdfJob): PdfVlmDigestResult | null {
  const pages = job.pagesData
    .filter((p) => p.extraction !== null)
    .map((p) => p.extraction!)
    .sort((a, b) => a.pageNumber - b.pageNumber);
  if (pages.length === 0) return null;

  const fullMarkdown = pages
    .map((p) => `## Página ${p.pageNumber} de ${job.totalPages}\n\n${p.markdownCompleto}\n\n---\n`)
    .join("\n");

  return {
    fileName: job.fileName,
    totalPagesInPdf: job.totalPages,
    pagesAnalyzed: pages.length,
    extractedAt: new Date().toISOString(),
    pages,
    fullMarkdown,
  };
}

export function PdfVlmExtractor() {
  const [jobs, setJobs] = useState<PdfJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveResults, setSaveResults] = useState<Record<string, { success: boolean; path?: string; error?: string }>>({});
  const [editingPage, setEditingPage] = useState<{ jobId: string; pageNumber: number } | null>(null);
  const [editContent, setEditContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef<Set<string>>(new Set());

  const selectedJob = useMemo(() => jobs.find((j) => j.id === selectedJobId) ?? null, [jobs, selectedJobId]);

  const handlePickPdfs = () => fileInputRef.current?.click();

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newJobs: PdfJob[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") continue;

      let pageCount = 0;
      try {
        pageCount = await getPdfPageCountInBrowser(file);
      } catch {
        pageCount = 0;
      }

      const job: PdfJob = {
        id: generateJobId(),
        file,
        fileName: file.name,
        status: "queued",
        pagesData: [],
        totalPages: Math.min(pageCount, MAX_PDF_VLM_PAGES),
        shouldStop: false,
      };
      newJobs.push(job);
    }

    if (newJobs.length > 0) {
      setJobs((prev) => [...prev, ...newJobs]);
      if (!selectedJobId) {
        setSelectedJobId(newJobs[0].id);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeJob = (jobId: string) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === jobId);
      if (job) {
        job.pagesData.forEach((p) => {
          if (p.blobUrl) URL.revokeObjectURL(p.blobUrl);
        });
        job.shouldStop = true;
        job.abortController?.abort();
        clearJobFromStorage(jobId);
      }
      return prev.filter((j) => j.id !== jobId);
    });
    if (selectedJobId === jobId) {
      setSelectedJobId((prev) => {
        const remaining = jobs.filter((j) => j.id !== jobId);
        return remaining.length > 0 ? remaining[0].id : null;
      });
    }
  };

  const updateJob = useCallback((jobId: string, updates: Partial<PdfJob>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j))
    );
  }, []);

  const updateJobPage = useCallback((jobId: string, pageNumber: number, updates: Partial<PageData>) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              pagesData: j.pagesData.map((p) =>
                p.pageNumber === pageNumber ? { ...p, ...updates } : p
              ),
            }
          : j
      )
    );
  }, []);

  const extractPage = async (
    job: PdfJob,
    pageData: PageData,
    signal: AbortSignal,
    maxTokensOverride?: number,
    paraphraseModeOverride?: boolean
  ): Promise<PdfPageVlmExtraction | null> => {
    const fd = new FormData();
    fd.set("image", pageData.blob, `page-${pageData.pageNumber}.png`);
    fd.set("pageNumber", String(pageData.pageNumber));
    fd.set("totalPages", String(job.totalPages));
    fd.set("fileName", job.fileName);
    if (pageData.feedback.trim()) {
      fd.set("feedback", pageData.feedback.trim());
    }
    if (maxTokensOverride) {
      fd.set("maxTokens", String(maxTokensOverride));
    }
    if (paraphraseModeOverride) {
      fd.set("paraphraseMode", "true");
    }

    const res = await fetch("/api/extras/pdf-vlm/page", {
      method: "POST",
      body: fd,
      signal,
    });

    const json: unknown = await res.json();

    if (!res.ok) {
      const msg =
        typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error: unknown }).error === "string"
          ? (json as { error: string }).error
          : `Error página ${pageData.pageNumber}`;
      throw new Error(msg);
    }

    const extraction =
      typeof json === "object" && json !== null && "extraction" in json
        ? (json as { extraction: PdfPageVlmExtraction }).extraction
        : null;

    if (!extraction || typeof extraction.pageNumber !== "number") {
      throw new Error(`Respuesta inválida página ${pageData.pageNumber}`);
    }

    return extraction;
  };

  const processJob = async (jobId: string) => {
    if (processingRef.current.has(jobId)) return;
    processingRef.current.add(jobId);

    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === "completed") {
      processingRef.current.delete(jobId);
      return;
    }

    const abortController = new AbortController();
    updateJob(jobId, { status: "rasterizing", abortController, shouldStop: false });

    try {
      const rendered = await renderPdfFileToPagePngBlobs(job.file);
      if (rendered.length === 0) {
        throw new Error("No se pudieron generar imágenes del PDF.");
      }

      const pagesData: PageData[] = rendered.map((r) => ({
        pageNumber: r.pageNumber,
        blob: r.blob,
        blobUrl: URL.createObjectURL(r.blob),
        extraction: null,
        status: "pending" as PageStatus,
        feedback: "",
      }));

      updateJob(jobId, {
        status: "extracting",
        pagesData,
        totalPages: rendered[0].totalPagesInFile,
      });

      const pendingPages = [...pagesData];
      const inProgress = new Map<number, Promise<void>>();

      const processNextPage = async () => {
        const currentJob = jobs.find((j) => j.id === jobId);
        if (currentJob?.shouldStop || abortController.signal.aborted) {
          return;
        }

        const nextPage = pendingPages.find(
          (p) => p.status === "pending" && !inProgress.has(p.pageNumber)
        );
        if (!nextPage) return;

        const pageNumber = nextPage.pageNumber;
        inProgress.set(pageNumber, (async () => {
          updateJobPage(jobId, pageNumber, { status: "extracting" });

          try {
            const extraction = await extractPage(
              { ...job, pagesData },
              nextPage,
              abortController.signal
            );

            updateJobPage(jobId, pageNumber, {
              extraction,
              status: "extracted",
            });

            const idx = pendingPages.findIndex((p) => p.pageNumber === pageNumber);
            if (idx !== -1) pendingPages[idx].status = "extracted";
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
              updateJobPage(jobId, pageNumber, { status: "pending" });
            } else {
              updateJobPage(jobId, pageNumber, {
                status: "error",
                error: err instanceof Error ? err.message : "Error desconocido",
              });
              const idx = pendingPages.findIndex((p) => p.pageNumber === pageNumber);
              if (idx !== -1) pendingPages[idx].status = "error";
            }
          } finally {
            inProgress.delete(pageNumber);
          }
        })());
      };

      while (true) {
        const currentJob = jobs.find((j) => j.id === jobId);
        if (currentJob?.shouldStop || abortController.signal.aborted) {
          await Promise.all(inProgress.values());
          updateJob(jobId, { status: "paused" });
          setJobs((prev) => {
            const j = prev.find((x) => x.id === jobId);
            if (j) saveJobToStorage(j);
            return prev;
          });
          break;
        }

        const remaining = pendingPages.filter(
          (p) => p.status === "pending" || p.status === "extracting"
        );
        if (remaining.length === 0) {
          updateJob(jobId, { status: "completed" });
          clearJobFromStorage(jobId);
          break;
        }

        while (inProgress.size < MAX_PARALLEL_PAGES) {
          const canStart = pendingPages.find(
            (p) => p.status === "pending" && !inProgress.has(p.pageNumber)
          );
          if (!canStart) break;
          processNextPage();
        }

        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (err) {
      updateJob(jobId, {
        status: "error",
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      processingRef.current.delete(jobId);
    }
  };

  const startJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    updateJob(jobId, { shouldStop: false });
    void processJob(jobId);
  };

  const pauseJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    job.shouldStop = true;
    job.abortController?.abort();
    updateJob(jobId, { shouldStop: true });
  };

  const startAllJobs = () => {
    jobs.forEach((job) => {
      if (job.status === "queued" || job.status === "paused") {
        startJob(job.id);
      }
    });
  };

  const confirmAllPages = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              pagesData: j.pagesData.map((p) =>
                p.extraction !== null ? { ...p, status: "confirmed" as PageStatus } : p
              ),
            }
          : j
      )
    );
  };

  const startEditingPage = (jobId: string, pageNumber: number) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const page = job.pagesData.find((p) => p.pageNumber === pageNumber);
    if (!page?.extraction) return;
    setEditingPage({ jobId, pageNumber });
    setEditContent(page.extraction.markdownCompleto);
  };

  const cancelEditing = () => {
    setEditingPage(null);
    setEditContent("");
  };

  const saveEditedContent = () => {
    if (!editingPage) return;
    const { jobId, pageNumber } = editingPage;
    
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              pagesData: j.pagesData.map((p) =>
                p.pageNumber === pageNumber && p.extraction
                  ? {
                      ...p,
                      extraction: {
                        ...p.extraction,
                        markdownCompleto: editContent,
                      },
                    }
                  : p
              ),
            }
          : j
      )
    );
    
    setEditingPage(null);
    setEditContent("");
  };

  const reextractPage = async (jobId: string, pageNumber: number, feedback: string, maxTokens?: number, paraphraseMode?: boolean) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const pageData = job.pagesData.find((p) => p.pageNumber === pageNumber);
    if (!pageData) return;

    updateJobPage(jobId, pageNumber, { status: "extracting", feedback, maxTokens, paraphraseMode });

    try {
      const abortController = new AbortController();
      const extraction = await extractPage(job, { ...pageData, feedback }, abortController.signal, maxTokens, paraphraseMode);
      updateJobPage(jobId, pageNumber, { extraction, status: "extracted", feedback: "", paraphraseMode: false });
    } catch (err) {
      updateJobPage(jobId, pageNumber, {
        status: "error",
        error: err instanceof Error ? err.message : "Error",
      });
    }
  };

  const saveJobToInfo2 = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const digest = getJobDigest(job);
    if (!digest) return;

    setSaving(jobId);
    try {
      const res = await fetch("/api/extras/pdf-vlm/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digest }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveResults((prev) => ({ ...prev, [jobId]: { success: false, error: json.error } }));
      } else {
        setSaveResults((prev) => ({ ...prev, [jobId]: { success: true, path: json.path } }));
        clearJobFromStorage(jobId);
      }
    } catch (err) {
      setSaveResults((prev) => ({
        ...prev,
        [jobId]: { success: false, error: err instanceof Error ? err.message : "Error" },
      }));
    } finally {
      setSaving(null);
    }
  };

  const downloadJobJson = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const digest = getJobDigest(job);
    if (!digest) return;

    const blob = new Blob([JSON.stringify(digest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safe = digest.fileName.replace(/[^\w.-]+/g, "_").slice(0, 80);
    a.download = `${safe || "pdf"}-vlm-digest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getJobProgress = (job: PdfJob) => {
    const extracted = job.pagesData.filter((p) => p.extraction !== null).length;
    const extracting = job.pagesData.filter((p) => p.status === "extracting").length;
    const errors = job.pagesData.filter((p) => p.status === "error").length;
    const confirmed = job.pagesData.filter((p) => p.status === "confirmed").length;
    return { extracted, extracting, errors, confirmed, total: job.pagesData.length || job.totalPages };
  };

  const allConfirmed = (job: PdfJob) => {
    return job.pagesData.length > 0 && job.pagesData.every((p) => p.status === "confirmed" || p.extraction === null);
  };

  const currentPage = selectedJob?.pagesData[currentPageIndex] ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6 animate-in fade-in duration-500">
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
          Herramienta extra · extracción paralela
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight">
          PDF + modelo de visión (Multi-archivo)
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-2xl">
          Sube múltiples PDFs y extrae información en paralelo. Procesa hasta {MAX_PARALLEL_PAGES} páginas simultáneamente por archivo.
        </p>
      </header>

      <section className="rounded-lg border border-[#4a7c59]/25 bg-white p-4 shadow-sm space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(ev) => void handleFilesSelected(ev.target.files)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handlePickPdfs}>
            <Plus className="w-4 h-4" /> Agregar PDFs
          </Button>
          {jobs.some((j) => j.status === "queued" || j.status === "paused") && (
            <Button
              type="button"
              size="sm"
              className="gap-1.5 bg-[#4a7c59] text-white hover:bg-[#3f6b4c]"
              onClick={startAllJobs}
            >
              <Play className="w-4 h-4" /> Iniciar todos
            </Button>
          )}
        </div>
      </section>

      {jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Cola de archivos ({jobs.length})
            </p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {jobs.map((job) => {
                const prog = getJobProgress(job);
                const isSelected = selectedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected ? "border-[#4a7c59] bg-[#F0FEE6]/30" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setCurrentPageIndex(0);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1a1a1a] truncate" title={job.fileName}>
                          {job.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {job.status === "queued" && (
                            <span className="text-xs text-gray-500">En cola</span>
                          )}
                          {job.status === "rasterizing" && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Rasterizando...
                            </span>
                          )}
                          {job.status === "extracting" && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {prog.extracted}/{prog.total} ({prog.extracting} en progreso)
                            </span>
                          )}
                          {job.status === "paused" && (
                            <span className="text-xs text-amber-600">
                              Pausado ({prog.extracted}/{prog.total})
                            </span>
                          )}
                          {job.status === "completed" && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completado
                            </span>
                          )}
                          {job.status === "error" && (
                            <span className="text-xs text-red-600">{job.error}</span>
                          )}
                        </div>
                        {(job.status === "extracting" || job.status === "paused") && prog.total > 0 && (
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#BBE795] to-[#4a7c59] transition-[width]"
                              style={{ width: `${(prog.extracted / prog.total) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {job.status === "queued" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); startJob(job.id); }}
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {job.status === "extracting" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); pauseJob(job.id); }}
                          >
                            <Pause className="w-4 h-4 text-amber-600" />
                          </Button>
                        )}
                        {job.status === "paused" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => { e.stopPropagation(); startJob(job.id); }}
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => { e.stopPropagation(); removeJob(job.id); }}
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {selectedJob && (
            <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{selectedJob.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {getJobProgress(selectedJob).extracted} de {getJobProgress(selectedJob).total} páginas extraídas
                  </p>
                </div>
                {selectedJob.pagesData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
                      disabled={currentPageIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-medium tabular-nums min-w-[60px] text-center">
                      {currentPageIndex + 1} / {selectedJob.pagesData.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageIndex((i) => Math.min(selectedJob.pagesData.length - 1, i + 1))}
                      disabled={currentPageIndex === selectedJob.pagesData.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {selectedJob.pagesData.length > 0 && currentPage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="p-3 bg-gray-50/30">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Original — Pág. {currentPage.pageNumber}
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm max-h-[400px] overflow-y-auto">
                      <img src={currentPage.blobUrl} alt={`Página ${currentPage.pageNumber}`} className="w-full h-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Extracción</p>
                      {currentPage.status === "extracting" && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Extrayendo...
                        </span>
                      )}
                      {currentPage.status === "extracted" && (
                        <span className="text-xs text-green-600">Extraída</span>
                      )}
                      {currentPage.status === "confirmed" && (
                        <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Confirmada
                        </span>
                      )}
                      {currentPage.status === "error" && (
                        <span className="text-xs text-red-600">{currentPage.error}</span>
                      )}
                    </div>
                    <div className="flex-1 min-h-0 max-h-[350px] overflow-y-auto border rounded-lg bg-white p-3 text-[12px] relative">
                      {editingPage?.jobId === selectedJob.id && editingPage?.pageNumber === currentPage.pageNumber ? (
                        <div className="h-full flex flex-col">
                          <textarea
                            className="flex-1 w-full text-xs font-mono border-0 resize-none focus:outline-none min-h-[280px]"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edita el contenido markdown..."
                          />
                          <div className="flex gap-2 pt-2 border-t mt-2">
                            <Button
                              type="button"
                              size="sm"
                              className="text-xs h-7 gap-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={saveEditedContent}
                            >
                              <Check className="w-3 h-3" /> Guardar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 gap-1"
                              onClick={cancelEditing}
                            >
                              <X className="w-3 h-3" /> Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : currentPage.extraction?.markdownCompleto ? (
                        <>
                          <Streamdown>{currentPage.extraction.markdownCompleto}</Streamdown>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/80 hover:bg-white"
                            onClick={() => startEditingPage(selectedJob.id, currentPage.pageNumber)}
                            title="Editar contenido"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <p className="text-gray-400 italic">Sin extracción aún.</p>
                      )}
                    </div>
                    {(currentPage.status === "extracted" || currentPage.status === "confirmed" || currentPage.status === "error") && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Re-extraer página</p>
                        <input
                          type="text"
                          placeholder="Qué falta o está mal..."
                          className="w-full text-xs border rounded px-2 py-1.5"
                          value={currentPage.feedback}
                          onChange={(e) => updateJobPage(selectedJob.id, currentPage.pageNumber, { feedback: e.target.value })}
                        />
                        <div className="flex items-center gap-3">
                          <select
                            className="text-xs border rounded px-2 py-1.5 bg-white"
                            value={currentPage.maxTokens ?? 65536}
                            onChange={(e) => updateJobPage(selectedJob.id, currentPage.pageNumber, { maxTokens: Number(e.target.value) })}
                          >
                            {TOKEN_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded border-gray-300"
                              checked={currentPage.paraphraseMode ?? false}
                              onChange={(e) => updateJobPage(selectedJob.id, currentPage.pageNumber, { paraphraseMode: e.target.checked })}
                            />
                            <span>Modo paráfrasis</span>
                            <span className="text-gray-400" title="Usa esto si ves error RECITATION">(anti-RECITATION)</span>
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => void reextractPage(
                            selectedJob.id, 
                            currentPage.pageNumber, 
                            currentPage.feedback,
                            currentPage.maxTokens,
                            currentPage.paraphraseMode
                          )}
                        >
                          <RefreshCw className="w-3 h-3" /> Re-extraer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedJob.status === "queued" ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Haz clic en Play para iniciar la extracción</p>
                </div>
              ) : selectedJob.status === "rasterizing" ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4a7c59]" />
                  <p>Rasterizando PDF...</p>
                </div>
              ) : null}

              {selectedJob.pagesData.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-1 overflow-x-auto">
                  {selectedJob.pagesData.map((p, i) => (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => setCurrentPageIndex(i)}
                      className={`shrink-0 w-6 h-6 rounded text-[10px] font-medium transition-colors ${
                        i === currentPageIndex
                          ? "bg-[#4a7c59] text-white"
                          : p.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "extracted"
                              ? "bg-blue-50 text-blue-600"
                              : p.status === "extracting"
                                ? "bg-amber-50 text-amber-600"
                                : p.status === "error"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.pageNumber}
                    </button>
                  ))}
                </div>
              )}

              {selectedJob.status === "completed" && (
                <div className="px-4 py-3 border-t border-gray-100 bg-[#F0FEE6]/30 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {!allConfirmed(selectedJob) && (
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                        onClick={() => confirmAllPages(selectedJob.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirmar todas
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => downloadJobJson(selectedJob.id)}
                    >
                      <Download className="w-4 h-4" /> Descargar JSON
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 bg-[#4a7c59] text-white hover:bg-[#3f6b4c] disabled:opacity-60"
                      onClick={() => void saveJobToInfo2(selectedJob.id)}
                      disabled={!allConfirmed(selectedJob) || saving === selectedJob.id}
                    >
                      {saving === selectedJob.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar en /info2/
                    </Button>
                  </div>
                  {saveResults[selectedJob.id] && (
                    <p className={`text-xs ${saveResults[selectedJob.id].success ? "text-green-700" : "text-red-700"}`}>
                      {saveResults[selectedJob.id].success
                        ? `Guardado: ${saveResults[selectedJob.id].path}`
                        : saveResults[selectedJob.id].error}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">
        Requiere clave Gemini en servidor (<span className="font-mono text-[11px]">GEMINI_API_KEY</span>).
        Máximo {MAX_PDF_VLM_PAGES} páginas por PDF. Procesa hasta {MAX_PARALLEL_PAGES} páginas en paralelo.
      </p>
    </div>
  );
}
