"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { ConversationProvider } from "@elevenlabs/react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useElevenLabsVoiceAgent } from "@/hooks/useElevenLabsVoiceAgent";
import { Button } from "@/components/ui/button";

function AsistenteCalculoContent() {
  const [error, setError] = useState<string | null>(null);

  const {
    startSession,
    endSession,
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
  } = useElevenLabsVoiceAgent({
    tokenEndpoint: "/api/elevenlabs-token-calculo",
    onConnect: () => setError(null),
    onError: (err) => setError(err),
  });

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <VoicePulse speaking={isSpeaking} />

      <div className="flex justify-center">
        {error ? (
          <span className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200">
            {error}
          </span>
        ) : isConnecting ? (
          <span className="flex items-center gap-1.5 rounded-full bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-500" />
            Conectando…
          </span>
        ) : isConnected ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[#F0FEE6] px-4 py-1.5 text-xs font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/40">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4a7c59]" />
            {isSpeaking ? "Hablando…" : isListening ? "Escuchando…" : "Conectado"}
          </span>
        ) : (
          <span className="rounded-full bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
            Listo para iniciar
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {!isConnected && !isConnecting && (
          <Button
            onClick={() => { setError(null); startSession(); }}
            size="lg"
            className="gap-2 rounded-full bg-[#4a7c59] hover:bg-[#3a6447] text-white px-8"
          >
            <Mic className="h-5 w-5" />
            Hablar
          </Button>
        )}
        {isConnected && (
          <Button
            onClick={endSession}
            size="lg"
            variant="outline"
            className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 px-8"
          >
            <Square className="h-5 w-5" />
            Detener
          </Button>
        )}
      </div>
    </div>
  );
}

export function AsistenteCalculoVoice() {
  return (
    <ConversationProvider>
      <AsistenteCalculoContent />
    </ConversationProvider>
  );
}
