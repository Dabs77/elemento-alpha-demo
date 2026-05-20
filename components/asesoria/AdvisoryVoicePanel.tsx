"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Mic, Square, Info, RefreshCw, Database } from "lucide-react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { Button } from "@/components/ui/button";

type VoiceContextApiOk = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
  mode?: "full" | "compact" | "rag";
  ragProvider?: "brainbox" | "local";
};

const FALLBACK_CONTEXT = JSON.stringify(
  {
    escenario: "Asesoría especializada · resumen",
    fuenteUnica: "Solo JSON digest VLM en /info — sin corpus cargado aún.",
    nota: "Reintenta cargar el contexto o inicia sesión de voz.",
  },
  null,
  2,
);

export function AdvisoryVoicePanel() {
  const [fundContext, setFundContext] = useState<string | null>(null);
  const [contextMeta, setContextMeta] = useState<{
    sourceFiles: string[];
    totalChars: number;
    truncated: boolean;
    mode: "full" | "compact" | "rag";
    ragProvider?: "brainbox" | "local";
  } | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const loadContext = useCallback(() => {
    setLoadState("loading");
    fetch("/api/fund-advisory-voice-context")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(typeof err?.error === "string" ? err.error : r.statusText);
        }
        return r.json() as Promise<VoiceContextApiOk>;
      })
      .then((data) => {
        setFundContext(data.context.trim() || FALLBACK_CONTEXT);
        setContextMeta({
          sourceFiles: data.sourceFiles,
          totalChars: data.totalChars,
          truncated: data.truncated,
          mode: data.mode ?? "compact",
          ragProvider: data.ragProvider,
        });
        setLoadState("ready");
        console.log(`[asesoría-voz] Proveedor RAG: BrainBox`);
      })
      .catch(() => {
        setFundContext(FALLBACK_CONTEXT);
        setContextMeta(null);
        setLoadState("error");
      });
  }, []);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const voiceOpts = useMemo(
    () => ({
      mode: "fund_advisory" as const,
      fundAdvisoryContext: fundContext ?? undefined,
      fundAdvisoryRag: true,
      fundAdvisoryRagProvider: "brainbox" as const,
    }),
    [fundContext],
  );

  const {
    startSession,
    endSession,
    isConnected,
    isConnecting,
    isSpeaking,
    error,
  } = useVoiceAgent(voiceOpts);

  const handleStart = useCallback(() => {
    startSession();
  }, [startSession]);

  const handleStop = useCallback(() => {
    endSession();
  }, [endSession]);

  const [showContextInfo, setShowContextInfo] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Asesor de Fondos por Voz</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Habla con el asistente sobre FIC Abierto y FIC CxC
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>BrainBox</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <VoicePulse speaking={isSpeaking} />

        <div className="flex justify-center">
          {error ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
              Error de conexión
            </span>
          ) : isConnecting ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Conectando con Gemini Live…
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#F0FEE6] px-3 py-1 text-xs font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4a7c59]" />
              {isSpeaking ? "Asistente · hablando" : "Micrófono · escucha activa"}
            </span>
          ) : loadState === "loading" ? (
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
              Cargando base de conocimiento…
            </span>
          ) : (
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
              Listo para iniciar
            </span>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {!isConnected && !isConnecting && (
            <Button
              onClick={handleStart}
              disabled={loadState !== "ready"}
              className="gap-2 rounded-full bg-[#4a7c59] hover:bg-[#3d6549] text-white px-5 py-2"
            >
              <Mic className="h-4 w-4" />
              Iniciar conversación
            </Button>
          )}
          {(isConnected || isConnecting) && (
            <Button
              onClick={handleStop}
              variant="outline"
              className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 px-5 py-2"
            >
              <Square className="h-4 w-4" />
              Detener
            </Button>
          )}
        </div>

        {loadState === "error" && (
          <div className="flex justify-center">
            <button
              onClick={loadContext}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="h-3 w-3" />
              Reintentar carga de contexto
            </button>
          </div>
        )}

        {contextMeta && (
          <div className="mt-2">
            <button
              onClick={() => setShowContextInfo(!showContextInfo)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mx-auto"
            >
              <Info className="h-3 w-3" />
              {showContextInfo ? "Ocultar info" : "Ver info de contexto"}
            </button>
            {showContextInfo && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-[10px] text-gray-600 space-y-1">
                <p>
                  <strong>Modo:</strong> RAG (BrainBox)
                </p>
                <p>
                  <strong>Archivos:</strong> {contextMeta.sourceFiles.length}
                </p>
                <p>
                  <strong>Caracteres:</strong> {contextMeta.totalChars.toLocaleString()}
                </p>
                {contextMeta.truncated && (
                  <p className="text-amber-600">Contexto truncado por límite de tamaño</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
