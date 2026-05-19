"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Mic, Square, Info, RefreshCw } from "lucide-react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { FUND_ADVISORY_CONTEXT } from "@/lib/asesoria/advisoryKnowledgeBase";
import { Button } from "@/components/ui/button";

type VoiceContextApiOk = {
  context: string;
  sourceFiles: string[];
  totalChars: number;
  truncated: boolean;
  mode?: "full" | "compact";
};

const FALLBACK_CONTEXT = JSON.stringify(
  {
    escenario: "Asesoría especializada · resumen (sin extractos PDF)",
    resumen: FUND_ADVISORY_CONTEXT,
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
    mode: "full" | "compact";
  } | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const loadContext = useCallback((opts?: { showLoading?: boolean }) => {
    if (opts?.showLoading) setLoadState("loading");
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
        });
        setLoadState("ready");
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

  const voiceContext = useMemo(
    () => fundContext ?? FALLBACK_CONTEXT,
    [fundContext],
  );

  const { startSession, endSession, isConnected, isConnecting, isSpeaking, error } =
    useVoiceAgent({
      voiceName: "Zephyr",
      mode: "fund_advisory",
      fundAdvisoryContext: voiceContext,
    });

  const canStart = loadState === "ready" || loadState === "error";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-sm font-semibold text-gray-900">Asesor de Fondos por Voz</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {loadState === "loading"
            ? "Preparando contexto de documentación…"
            : contextMeta?.mode === "full"
              ? "FIC Abierto · FIC CxC · JSON íntegro (modo full — alto consumo de cuota)"
              : "FIC Abierto · FIC CxC · extractos clave de documentación (modo compacto)"}
        </p>
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
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
              Listo para iniciar
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-800 leading-relaxed">
            <p>{error}</p>
            {(error.includes("Cuota") || error.includes("quota")) && (
              <p className="mt-2 text-red-700">
                Revisa tu plan en{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Google AI Studio
                </a>
                . Para probar sin JSON completo, elimina{" "}
                <code className="rounded bg-white/80 px-1">FUND_ADVISORY_VOICE_FULL_JSON=1</code> de{" "}
                <code className="rounded bg-white/80 px-1">.env.local</code> y reinicia el servidor.
              </p>
            )}
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
            <span>Contexto reducido (sin JSON de documentos).</span>
            <button
              type="button"
              onClick={() => loadContext({ showLoading: true })}
              className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium ring-1 ring-amber-300"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          </div>
        )}

        {contextMeta && loadState === "ready" && (
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            {contextMeta.sourceFiles.length} documentos · ~{(contextMeta.totalChars / 1000).toFixed(0)}k
            caracteres · modo {contextMeta.mode === "full" ? "JSON completo" : "compacto"}
            {contextMeta.truncated ? " · truncado" : ""}
          </p>
        )}

        <div className="flex justify-center gap-2">
          {isConnecting ? (
            <Button disabled variant="outline" className="h-10 rounded-lg px-6 w-full">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Conectando…
            </Button>
          ) : !isConnected ? (
            <Button
              type="button"
              onClick={() => void startSession()}
              disabled={!canStart}
              className="h-10 w-full rounded-lg bg-[#4a7c59] px-6 font-semibold text-white hover:bg-[#3f6b4c] disabled:opacity-50"
            >
              <Mic className="mr-2 h-4 w-4" />
              Hablar con el asesor
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => endSession()}
              variant="outline"
              className="h-10 w-full rounded-lg border-red-200 bg-red-50 px-5 font-semibold text-red-700 hover:bg-red-100"
            >
              <Square className="mr-2 h-3 w-3 fill-current" />
              Finalizar llamada
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-700 mb-1">Preguntas sugeridas:</p>
            <ul className="space-y-0.5 text-gray-500">
              <li>• ¿Qué rentabilidad tuvo el FIC CxC en marzo?</li>
              <li>• ¿Cuál tiene mejor liquidez, Abierto o CxC?</li>
              <li>• ¿Qué dice el prospecto sobre comisiones?</li>
              <li>• ¿Cómo se comportó el fondo en el COVID?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
