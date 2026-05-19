"use client";

import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, Info, RefreshCw } from "lucide-react";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";

type DigestApiOk = {
  markdown: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
};

export function AdvisoryVoicePanel() {
  const [digestMarkdown, setDigestMarkdown] = useState<string | undefined>(undefined);
  const [digestStatus, setDigestStatus] = useState<"loading" | "ready" | "error">("loading");
  const [digestMeta, setDigestMeta] = useState<{
    sourceFiles: string[];
    totalChars: number;
    truncated: boolean;
  } | null>(null);

  const loadDigests = useCallback((opts?: { showLoadingPulse?: boolean }) => {
    if (opts?.showLoadingPulse) {
      setDigestStatus("loading");
    }
    fetch("/api/fund-advisory-digests")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(typeof err?.error === "string" ? err.error : r.statusText);
        }
        return r.json() as Promise<DigestApiOk>;
      })
      .then((data) => {
        setDigestMarkdown(data.markdown.trim() || undefined);
        setDigestMeta({
          sourceFiles: data.sourceFiles,
          totalChars: data.totalChars,
          truncated: data.truncated,
        });
        setDigestStatus("ready");
      })
      .catch(() => {
        setDigestStatus("error");
        setDigestMeta(null);
        setDigestMarkdown(undefined);
      });
  }, []);

  useEffect(() => {
    loadDigests();
  }, [loadDigests]);

  const useSummaryOnly = useCallback(() => {
    setDigestMarkdown(undefined);
    setDigestMeta(null);
    setDigestStatus("ready");
  }, []);

  const {
    startSession,
    endSession,
    isConnected,
    isConnecting,
    isSpeaking,
    error,
  } = useVoiceAgent({
    voiceName: "Zephyr",
    mode: "fund_advisory",
    fundAdvisoryDigestMarkdown: digestMarkdown,
  });

  const canConnect = digestStatus === "ready";

  const handleToggle = useCallback(() => {
    if (isConnected) {
      endSession();
    } else {
      startSession();
    }
  }, [isConnected, endSession, startSession]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isConnected
                ? isSpeaking
                  ? "bg-green-100 animate-pulse"
                  : "bg-blue-100"
                : "bg-gray-100"
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-4 h-4 text-green-600" />
            ) : isConnected ? (
              <Mic className="w-4 h-4 text-blue-600" />
            ) : (
              <MicOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Asesor de Fondos por Voz</h3>
            <p className="text-xs text-gray-500">
              {digestStatus === "loading"
                ? "Cargando documentación (JSON /info)…"
                : isConnected
                  ? isSpeaking
                    ? "Respondiendo…"
                    : "Escuchando…"
                  : digestStatus === "error"
                    ? "No se cargó el corpus PDF"
                    : digestMarkdown
                      ? `Corpus listo · ${digestMeta?.sourceFiles.length ?? 0} archivos`
                      : "Modo resumen (sin corpus)"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {digestStatus === "error" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 space-y-2">
            <p>No se pudo leer la carpeta <code className="text-[11px]">info/</code>. Reintenta o conecta solo con el resumen.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadDigests({ showLoadingPulse: true })}
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium ring-1 ring-amber-300 hover:bg-amber-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar
              </button>
              <button
                type="button"
                onClick={useSummaryOnly}
                className="rounded-md bg-amber-800/10 px-2.5 py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-800/15"
              >
                Solo resumen
              </button>
            </div>
          </div>
        )}

        {digestStatus === "ready" && digestMeta && digestMarkdown && (
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Incluye VLM de: {digestMeta.sourceFiles.join(", ")}
            {digestMeta.truncated && " · corpus truncado por límite de tamaño"}
            {digestMeta.totalChars > 0 && ` · ~${(digestMeta.totalChars / 1000).toFixed(0)}k caracteres`}
          </p>
        )}

        {/* Connection Button */}
        <button
          onClick={handleToggle}
          disabled={isConnecting || (!isConnected && !canConnect)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
            isConnected
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : isConnecting || !canConnect
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#4a7c59] text-white hover:bg-[#3d6549]"
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Conectando…
            </>
          ) : isConnected ? (
            <>
              <MicOff className="w-4 h-4" />
              Desconectar
            </>
          ) : digestStatus === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Esperando documentación…
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Iniciar consulta por voz
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Voice Activity Indicator */}
        {isConnected && (
          <div className="flex items-center justify-center gap-1 py-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-300"
                }`}
                style={{
                  height: isSpeaking ? `${12 + (i % 4) * 3}px` : "8px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-700 mb-1">Preguntas sugeridas:</p>
            <ul className="space-y-0.5 text-gray-500">
              <li>• ¿Qué dice el prospecto sobre comisiones?</li>
              <li>• ¿Cuál fondo coincide más con necesidad de liquidez vista?</li>
              <li>• Detalle de la lámina de composición del FIC Abierto</li>
              <li>• Qué establece el reglamento del fondo abierto sobre retiros</li>
            </ul>
          </div>
        </div>

        {/* Technical Note */}
        <p className="text-[10px] text-gray-400 text-center">
          Corpus = markdown de todos los <code className="text-[10px]">*.pdf-vlm-digest.json</code> en{" "}
          <code className="text-[10px]">/info</code> · Gemini Live
        </p>
      </div>
    </div>
  );
}
