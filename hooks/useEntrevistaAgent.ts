"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import {
  computeCompleteness,
  computeMissing,
  createFichaFromSetup,
  mergeFicha,
  type EntrevistaFicha,
  type EntrevistaSetup,
  type MissingField,
} from "@/lib/entrevista/harness";
import {
  buildEntrevistaSystemInstruction,
  buildHarnessNudge,
} from "@/lib/entrevista/prompts";

type VoiceCloseReason = { code?: number; reason?: string };

type LiveVoiceSession = {
  close: () => void;
  sendClientContent: (params: {
    turns?: { role?: string; parts?: { text?: string }[] }[];
    turnComplete?: boolean;
  }) => void;
  sendRealtimeInput: (params: {
    audio?: { data: string; mimeType: string };
    text?: string;
  }) => void;
};

export interface TranscriptTurn {
  speaker: "agente" | "persona";
  text: string;
}

/** Silencio tras el último fragmento transcrito antes de disparar la extracción. */
const EXTRACT_DEBOUNCE_MS = 2500;
/** Ventana de transcripción enviada al extractor. Acota el prompt en entrevistas largas. */
const TRANSCRIPT_WINDOW_CHARS = 6000;
/** Bajo este umbral no vale la pena gastar una llamada al extractor. */
const MIN_NEW_CHARS_TO_EXTRACT = 40;

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});

function formatLiveCloseError(code?: number, reason?: string): string {
  const r = (reason ?? "").toLowerCase();
  if (code === 1011 || r.includes("quota") || r.includes("billing")) {
    return "Cuota de Gemini agotada. Revisa la facturación en aistudio.google.com.";
  }
  return `Conexión cerrada (${code ?? "?"}): ${reason || "sin razón"}`;
}

function renderTranscript(turns: TranscriptTurn[]): string {
  return turns
    .map((t) => `[${t.speaker === "agente" ? "Agente" : "Persona"}]: ${t.text}`)
    .join("\n");
}

function sendHarnessNudge(session: LiveVoiceSession, missing: MissingField[]): void {
  session.sendClientContent({
    turns: [{ role: "user", parts: [{ text: buildHarnessNudge(missing) }] }],
    turnComplete: true,
  });
}

export interface UseEntrevistaAgentOptions {
  setup: EntrevistaSetup;
  voiceName?: string;
}

/**
 * Agente de voz para la entrevista de necesidades.
 *
 * Hook propio y no un modo más de `useVoiceAgent`: el flujo acá es distinto
 * (transcripción de ambos lados, extracción estructurada, reinyección del harness)
 * y aquel archivo ya carga cinco modos.
 *
 * El agente conversa sin saber nada del esquema. En paralelo, la transcripción se
 * manda con debounce a `/api/entrevista/extract`, la ficha se fusiona de forma
 * conservadora y, si cambió lo que falta, se le inyecta al agente hacia dónde ir.
 * Si el extractor falla, la conversación sigue con la última ficha buena.
 */
export function useEntrevistaAgent({ setup, voiceName = "Zephyr" }: UseEntrevistaAgentOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ficha, setFicha] = useState<EntrevistaFicha>(() => createFichaFromSetup(setup));
  const [missing, setMissing] = useState<MissingField[]>(() =>
    computeMissing(createFichaFromSetup(setup))
  );
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);

  const sessionRef = useRef<Promise<LiveVoiceSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // captura 16kHz
  const playAudioContextRef = useRef<AudioContext | null>(null); // reproducción 24kHz
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  const setupRef = useRef(setup);
  const fichaRef = useRef<EntrevistaFicha>(createFichaFromSetup(setup));
  const missingKeysRef = useRef<string>("");
  const turnsRef = useRef<TranscriptTurn[]>([]);
  /** Turno en construcción: los fragmentos de transcripción llegan troceados. */
  const pendingTurnRef = useRef<TranscriptTurn | null>(null);
  const extractTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const extractInFlightRef = useRef(false);
  const lastExtractedCharsRef = useRef(0);

  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  // ── Reproducción de audio PCM base64 (24kHz) ─────────────────────────────
  const playBase64Pcm = useCallback((base64: string) => {
    const ctx = playAudioContextRef.current;
    if (!ctx) return;

    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768.0;

    const buffer = ctx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    if (nextPlayTimeRef.current < ctx.currentTime) nextPlayTimeRef.current = ctx.currentTime;
    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += buffer.duration;

    activeSourcesRef.current.push(source);
    setIsSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) setIsSpeaking(false);
    };
  }, []);

  const stopAudioPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* ignore */
      }
    });
    activeSourcesRef.current = [];
    if (playAudioContextRef.current) {
      nextPlayTimeRef.current = playAudioContextRef.current.currentTime;
    }
    setIsSpeaking(false);
  }, []);

  // ── Acumulación de transcripción ─────────────────────────────────────────
  /** Cierra el turno en curso y lo agrega a la transcripción. */
  const flushPendingTurn = useCallback(() => {
    const pending = pendingTurnRef.current;
    pendingTurnRef.current = null;
    if (!pending || !pending.text.trim()) return;
    turnsRef.current = [...turnsRef.current, { ...pending, text: pending.text.trim() }];
    setTranscript(turnsRef.current);
  }, []);

  const appendTranscriptChunk = useCallback(
    (speaker: TranscriptTurn["speaker"], text: string) => {
      if (!text) return;
      const pending = pendingTurnRef.current;
      if (pending && pending.speaker === speaker) {
        pending.text += text;
        return;
      }
      // Cambió quien habla: se cierra el turno anterior y se abre uno nuevo.
      flushPendingTurn();
      pendingTurnRef.current = { speaker, text };
    },
    [flushPendingTurn]
  );

  // ── Extracción estructurada ──────────────────────────────────────────────
  const runExtraction = useCallback(async () => {
    if (extractInFlightRef.current) return;

    flushPendingTurn();
    const full = renderTranscript(turnsRef.current);
    if (full.length - lastExtractedCharsRef.current < MIN_NEW_CHARS_TO_EXTRACT) return;

    extractInFlightRef.current = true;
    lastExtractedCharsRef.current = full.length;
    setIsExtracting(true);

    try {
      const res = await fetch("/api/entrevista/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup: setupRef.current,
          fichaActual: fichaRef.current,
          transcript: full.slice(-TRANSCRIPT_WINDOW_CHARS),
        }),
      });

      if (!res.ok) throw new Error(`extract ${res.status}`);

      const data = (await res.json()) as { ficha?: EntrevistaFicha };
      if (!data.ficha) throw new Error("respuesta sin ficha");

      // Se vuelve a fusionar en cliente: pudo haber llegado más conversación
      // mientras la petición estaba en vuelo.
      const merged = mergeFicha(fichaRef.current, data.ficha);
      fichaRef.current = merged;
      setFicha(merged);
      setExtractError(null);

      const nextMissing = computeMissing(merged);
      setMissing(nextMissing);

      // Solo se molesta al agente si cambió lo que falta.
      const nextKeys = nextMissing.map((m) => m.key).join(",");
      if (nextKeys !== missingKeysRef.current) {
        missingKeysRef.current = nextKeys;
        const session = await sessionRef.current;
        if (session) sendHarnessNudge(session, nextMissing);
      }
    } catch (err) {
      // La entrevista no se interrumpe por un fallo del extractor: la ficha queda
      // en su último estado bueno y se avisa discretamente en la UI.
      console.warn("[entrevista] extracción falló:", err);
      setExtractError("No se pudo actualizar la ficha. La entrevista continúa.");
    } finally {
      extractInFlightRef.current = false;
      setIsExtracting(false);
    }
  }, [flushPendingTurn]);

  const scheduleExtraction = useCallback(() => {
    if (extractTimerRef.current) clearTimeout(extractTimerRef.current);
    extractTimerRef.current = setTimeout(() => {
      void runExtraction();
    }, EXTRACT_DEBOUNCE_MS);
  }, [runExtraction]);

  // ── Limpieza ─────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (extractTimerRef.current) {
      clearTimeout(extractTimerRef.current);
      extractTimerRef.current = null;
    }
    if (sessionRef.current) {
      void sessionRef.current.then((s) => {
        try {
          s.close();
        } catch {
          /* ignore */
        }
      });
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    stopAudioPlayback();
    if (playAudioContextRef.current) {
      playAudioContextRef.current.close().catch(() => {});
      playAudioContextRef.current = null;
    }
  }, [stopAudioPlayback]);

  const endSession = useCallback(() => {
    flushPendingTurn();
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
  }, [cleanup, flushPendingTurn]);

  // ── Iniciar sesión Live ──────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setExtractError(null);

    const initialFicha = createFichaFromSetup(setupRef.current);
    fichaRef.current = initialFicha;
    setFicha(initialFicha);
    const initialMissing = computeMissing(initialFicha);
    setMissing(initialMissing);
    missingKeysRef.current = initialMissing.map((m) => m.key).join(",");
    turnsRef.current = [];
    pendingTurnRef.current = null;
    setTranscript([]);
    lastExtractedCharsRef.current = 0;
    extractInFlightRef.current = false;

    try {
      playAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playAudioContextRef.current.currentTime;

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);

      const workletCode = `
        class AudioRecorder extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const channelData = input[0];
              const pcm16 = new Int16Array(channelData.length);
              for (let i = 0; i < channelData.length; i++) {
                let s = Math.max(-1, Math.min(1, channelData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              this.port.postMessage(pcm16);
            }
            return true;
          }
        }
        registerProcessor('audio-recorder', AudioRecorder);
      `;
      const blob = new Blob([workletCode], { type: "application/javascript" });
      await audioContextRef.current.audioWorklet.addModule(URL.createObjectURL(blob));
      const recorderNode = new AudioWorkletNode(audioContextRef.current, "audio-recorder");

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          systemInstruction: buildEntrevistaSystemInstruction(setupRef.current),
          // Ambas transcripciones: sin las preguntas del agente el extractor no
          // puede interpretar respuestas como "unas cuarenta por semana".
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsConnected(true);

            void sessionPromise.then((session) => {
              const liveSession = session as LiveVoiceSession;

              recorderNode.port.onmessage = (e) => {
                const pcm16 = e.data as Int16Array;
                const buffer = new ArrayBuffer(pcm16.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < pcm16.length; i++) view.setInt16(i * 2, pcm16[i], true);
                let binary = "";
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);

                try {
                  liveSession.sendRealtimeInput({
                    audio: { data: window.btoa(binary), mimeType: "audio/pcm;rate=16000" },
                  });
                } catch {
                  /* envío rechazado si la sesión ya cerró */
                }
              };

              source.connect(recorderNode);
              recorderNode.connect(audioContextRef.current!.destination);
            });
          },

          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              stopAudioPlayback();
            }

            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) playBase64Pcm(part.inlineData.data);
            }

            const raw = message.serverContent as Record<string, unknown> | undefined;
            const input = raw?.inputTranscription as { text?: string } | undefined;
            const output = raw?.outputTranscription as { text?: string } | undefined;

            if (output?.text) appendTranscriptChunk("agente", output.text);
            if (input?.text) {
              appendTranscriptChunk("persona", input.text);
              // Solo lo que dice la persona aporta datos nuevos a la ficha.
              scheduleExtraction();
            }

            if (message.serverContent?.turnComplete) {
              flushPendingTurn();
            }
          },

          onerror: (err) => {
            console.error("[entrevista] error de Gemini Live:", err);
            setError("Error de conexión. Intenta de nuevo.");
            cleanup();
            setIsConnected(false);
            setIsConnecting(false);
          },

          onclose: (event: VoiceCloseReason) => {
            console.warn("[entrevista] sesión cerrada:", event?.code, event?.reason);
            cleanup();
            if (event?.code && event.code !== 1000) {
              setError(formatLiveCloseError(event.code, event.reason));
            }
            setIsConnected(false);
            setIsConnecting(false);
          },
        },
      });

      sessionRef.current = sessionPromise as Promise<LiveVoiceSession>;
    } catch (err) {
      console.error("[entrevista] no se pudo iniciar la sesión:", err);
      setError("No se pudo conectar con la IA. Revisa el permiso del micrófono.");
      cleanup();
      setIsConnecting(false);
    }
  }, [
    voiceName,
    playBase64Pcm,
    stopAudioPlayback,
    cleanup,
    appendTranscriptChunk,
    flushPendingTurn,
    scheduleExtraction,
  ]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
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
    completeness: computeCompleteness(ficha),
    transcript,
  };
}
