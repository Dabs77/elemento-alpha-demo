"use client";

import { useState } from "react";
import { Mic, Square, Info, Volume2, VolumeX } from "lucide-react";
import { ConversationProvider } from "@elevenlabs/react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useElevenLabsVoiceAgent } from "@/hooks/useElevenLabsVoiceAgent";
import { Button } from "@/components/ui/button";

function ElevenLabsAgentContent() {
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    startSession,
    endSession,
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    isMuted,
    setMuted,
  } = useElevenLabsVoiceAgent({
    onConnect: () => setError(null),
    onDisconnect: () => {},
    onError: (err) => setError(err),
  });

  const handleStart = () => {
    setError(null);
    startSession();
  };

  const handleStop = () => endSession();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-purple-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Asesor por Voz</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              ElevenLabs Conversational AI
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-purple-700 shadow-sm ring-1 ring-purple-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3h3v18H6V3zm9 0h3v18h-3V3z"/>
            </svg>
            <span>ElevenLabs</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <VoicePulse speaking={isSpeaking} />

        <div className="flex justify-center">
          {error ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
              {error}
            </span>
          ) : isConnecting ? (
            <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
              Conectando…
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#F0FEE6] px-3 py-1 text-xs font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4a7c59]" />
              {isSpeaking ? "Hablando…" : isListening ? "Escuchando…" : "Conectado"}
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
              className="gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-5 py-2"
            >
              <Mic className="h-4 w-4" />
              Iniciar
            </Button>
          )}
          {isConnected && (
            <>
              <Button
                onClick={() => setMuted(!isMuted)}
                variant="outline"
                className={`gap-2 rounded-full px-4 py-2 ${
                  isMuted ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-600"
                }`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 px-4 py-2"
              >
                <Square className="h-4 w-4" />
                Detener
              </Button>
            </>
          )}
        </div>

        <div className="mt-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mx-auto"
          >
            <Info className="h-3 w-3" />
            {showInfo ? "Ocultar" : "Info"}
          </button>
          {showInfo && (
            <div className="mt-2 rounded-lg bg-gray-50 p-3 text-[10px] text-gray-600 space-y-1">
              <p>
                <strong>Motor:</strong> ElevenLabs Conversational AI
              </p>
              <p>
                <strong>RAG:</strong> Configurado en el agente de ElevenLabs
              </p>
              <p className="text-purple-600">
                La base de conocimiento se gestiona desde el dashboard de ElevenLabs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Panel de voz con ElevenLabs.
 * Comunicación directa por voz con el agente configurado en ElevenLabs.
 */
export function AdvisoryVoicePanelElevenLabs() {
  return (
    <ConversationProvider>
      <ElevenLabsAgentContent />
    </ConversationProvider>
  );
}
