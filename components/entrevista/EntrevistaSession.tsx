"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { FichaPanel } from "@/components/entrevista/FichaPanel";
import { useEntrevistaAgent } from "@/hooks/useEntrevistaAgent";
import type { EntrevistaSetup } from "@/lib/entrevista/harness";

export function EntrevistaSession({
  setup,
  onReset,
}: {
  setup: EntrevistaSetup;
  onReset: () => void;
}) {
  const {
    startSession,
    endSession,
    isConnected,
    isConnecting,
    isSpeaking,
    error,
    extractError,
    isExtracting,
    ficha,
    missing,
    completeness,
    transcript,
  } = useEntrevistaAgent({ setup });

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem] items-start">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a1a]">
              {setup.empresa} · {setup.area}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{setup.rol}</p>
          </div>
          {!isConnected && !isConnecting && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Cambiar datos
            </Button>
          )}
        </div>

        <div className="px-6 py-8">
          <VoicePulse speaking={isSpeaking} />

          <div className="mt-6 flex justify-center">
            {isConnected ? (
              <Button variant="outline" onClick={endSession}>
                <Square className="w-4 h-4" />
                Terminar entrevista
              </Button>
            ) : (
              <Button onClick={() => void startSession()} disabled={isConnecting}>
                <Mic className="w-4 h-4" />
                {isConnecting ? "Conectando…" : "Iniciar entrevista"}
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-4 flex items-start justify-center gap-2 text-sm text-red-600 text-center">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
          {extractError && !error && (
            <p className="mt-4 text-xs text-amber-700 text-center">{extractError}</p>
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Transcripción
          </h3>
          {transcript.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              La conversación aparecerá aquí a medida que avance.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {transcript.map((turn, i) => (
                <div key={i} className="animate-in fade-in duration-300">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      turn.speaker === "agente" ? "text-[#4a7c59]" : "text-gray-400"
                    }`}
                  >
                    {turn.speaker === "agente" ? "Agente" : "Persona"}
                  </span>
                  <p className="text-sm text-gray-700 mt-0.5">{turn.text}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
      </div>

      <FichaPanel
        ficha={ficha}
        missing={missing}
        completeness={completeness}
        isExtracting={isExtracting}
      />
    </div>
  );
}
