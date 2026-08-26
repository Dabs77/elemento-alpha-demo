import { useEffect, useRef, useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { useElevenLabsVoiceAgent } from "@/hooks/useElevenLabsVoiceAgent";
import { MicIcon } from "./icons";
import { useJourneyBrand } from "./brand";

type Props = { go: (n: number) => void };

type Msg = { role: "user" | "assistant"; content: string };

function VozContent({ go }: Props) {
  const brand = useJourneyBrand();
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

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
    tokenEndpoint: brand.tokenEndpoint,
    onConnect: () => setError(null),
    onError: (err) => setError(err),
    onMessage: (m) =>
      setMessages((prev) => [...prev, { role: m.role as Msg["role"], content: m.content }]),
  });

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content;
  const active = isConnected || isConnecting;

  const handleMic = () => {
    if (active) {
      endSession();
    } else {
      setError(null);
      startSession();
    }
  };

  return (
    <div className="voice">
      <div className="voice-main">
        <div className="vt">
          <h2>Asistente por voz</h2>
          {error ? (
            <span className="live" style={{ color: "#ffb4b4", background: "rgba(220,38,38,.16)", borderColor: "rgba(220,38,38,.3)" }}>
              {error}
            </span>
          ) : isConnecting ? (
            <span className="live"><i />Conectando…</span>
          ) : isConnected ? (
            <span className="live"><i />{isSpeaking ? "Hablando" : "Escuchando"}</span>
          ) : (
            <span className="live" style={{ color: "#9fe3ff", background: "rgba(0,160,220,.12)" }}>
              Listo para iniciar
            </span>
          )}
        </div>
        <div className="orb-stage">
          <div className="orb-wrap">
            <span className="orb-ring" />
            <span className="orb-ring" />
            <span className="orb-ring" />
            <div className="orb-core">
              <MicIcon />
            </div>
          </div>
          <div className={`wave${isConnected && (isSpeaking || isListening) ? "" : " idle"}`}>
            <span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="heard">
            {lastUser ? (
              <>
                <div className="q">El asesor pregunta</div>
                <h3>“{lastUser}”</h3>
              </>
            ) : (
              <>
                <div className="q">{brand.assistantName}</div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: "#cfe6f5" }}>
                  {isConnected ? "Te escucho. Hazme tu consulta." : brand.voicePrompt}
                </h3>
              </>
            )}
          </div>
          <div className="mic-controls">
            <button
              className="mic-side"
              onClick={() => isConnected && setMuted(!isMuted)}
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 10v4M7 6v12M11 3v18M15 7v10M19 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className={`mic-btn${active ? " stop" : ""}`} onClick={handleMic}>
              {active ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                </svg>
              ) : (
                <MicIcon />
              )}
            </button>
            <button className="mic-side" title="Salida de audio">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="suggest">
            <button className="chipq">¿Cuál tiene mejor rentabilidad?</button>
            <button className="chipq">Explícame el pacto de 30 días</button>
            <button className="chipq">¿Qué es el riesgo cuasi-soberano?</button>
          </div>
        </div>
      </div>
      <div className="voice-side">
        <div className="vs-h">
          <svg viewBox="0 0 24 24" width={16} fill="none" style={{ color: "var(--cyan-d)" }}>
            <path d="M8 10h8M8 14h5M21 12a9 9 0 0 1-13 8l-5 1 1-5a9 9 0 1 1 17-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Transcripción
          <span className="src">{brand.sourcesLabel}</span>
        </div>
        <div className="transcript" ref={transcriptRef}>
          {messages.length === 0 ? (
            <p className="empty">
              La transcripción de la conversación aparecerá aquí.
              <br />
              Pulsa el micrófono para comenzar a hablar con el asistente.
            </p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
                <div className="who">{m.role === "user" ? "Asesor" : brand.assistantName}</div>
                {m.content}
              </div>
            ))
          )}
        </div>
        <div className="vs-actions">
          <button className="btn ghost sm" onClick={() => go(2)}>
            Ver comparativa
          </button>
          <button className="btn green sm" onClick={() => go(4)}>
            Iniciar vinculación
          </button>
        </div>
      </div>
    </div>
  );
}

export function JourneyVoz({ go }: Props) {
  return (
    <ConversationProvider>
      <VozContent go={go} />
    </ConversationProvider>
  );
}
