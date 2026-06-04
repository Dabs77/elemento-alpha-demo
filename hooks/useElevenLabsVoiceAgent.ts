"use client";

import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";

export type UseElevenLabsVoiceAgentOptions = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onMessage?: (message: { role: string; content: string }) => void;
  tokenEndpoint?: string;
};

/**
 * Hook para comunicación por voz con el agente de ElevenLabs.
 * El RAG se configura directamente en el dashboard de ElevenLabs.
 */
export function useElevenLabsVoiceAgent(opts: UseElevenLabsVoiceAgentOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[ElevenLabs] Conectado");
      opts.onConnect?.();
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Desconectado");
      opts.onDisconnect?.();
    },
    onError: (error) => {
      console.error("[ElevenLabs] Error:", error);
      opts.onError?.(typeof error === "string" ? error : "Error de conexión");
    },
    onMessage: (message) => {
      console.log("[ElevenLabs] Mensaje:", message);
      if (message.message) {
        opts.onMessage?.({
          role: message.source === "user" ? "user" : "assistant",
          content: message.message,
        });
      }
    },
  });

  const startSession = useCallback(async () => {
    setIsLoading(true);

    try {
      // Obtener signed URL del backend
      const tokenResponse = await fetch(opts.tokenEndpoint ?? "/api/elevenlabs-token");
      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.error || "Error al obtener token");
      }

      const { signedUrl } = await tokenResponse.json();

      // Iniciar sesión con ElevenLabs
      await conversation.startSession({ signedUrl });
    } catch (error) {
      console.error("[ElevenLabs] Error al iniciar sesión:", error);
      opts.onError?.(error instanceof Error ? error.message : "Error al conectar");
    } finally {
      setIsLoading(false);
    }
  }, [conversation, opts]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    startSession,
    endSession,
    isConnected: conversation.status === "connected",
    isConnecting: conversation.status === "connecting" || isLoading,
    isSpeaking: conversation.isSpeaking,
    isListening: !conversation.isSpeaking && conversation.status === "connected",
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    status: conversation.status,
  };
}
