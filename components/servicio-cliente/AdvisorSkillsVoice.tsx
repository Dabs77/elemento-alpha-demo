"use client";

import * as React from "react";
import { Loader2, MessageSquare, Mic, MicOff, SendHorizontal, Sparkles, Users } from "lucide-react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_ROLE_IDS, SKILL_ROLE_LABELS, type SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";
import { SKILL_VOICE_HINTS } from "@/lib/servicio-cliente/skillsVoiceHints";
import {
  getSkillsPredefinedExactReply,
  SKILLS_PREDEFINED_QUESTION_LABELS,
} from "@/lib/servicio-cliente/skillConsultPredefinedQA";

type ChatMsg =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; streaming: boolean };

type GeminiHistoryTurn = { role: "user" | "model"; parts: { text: string }[] };

/** Tipos mínimos para Web Speech API (no siempre en lib del proyecto). */
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function uid() {
  return crypto.randomUUID();
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Props = {
  selectedRole: SkillRoleId;
  onRoleChange: (role: SkillRoleId) => void;
};

export function AdvisorSkillsVoice({ selectedRole, onRoleChange }: Props) {
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [isReplying, setIsReplying] = React.useState(false);
  const [micListening, setMicListening] = React.useState(false);
  const [micError, setMicError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  /** Texto del campo al iniciar el dictado (se concatena con lo reconocido). */
  const dictationBaselineRef = React.useRef("");

  const hints = SKILL_VOICE_HINTS[selectedRole];

  React.useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  React.useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stopMic = React.useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setMicListening(false);
  }, []);

  const toggleMic = React.useCallback(() => {
    setMicError(null);
    if (micListening) {
      stopMic();
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setMicError("Este navegador no permite dictado por voz.");
      return;
    }

    dictationBaselineRef.current = draft;

    const rec = new Ctor();
    rec.lang = "es-CO";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: SpeechRecognitionEventLike) => {
      let finals = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const row = event.results[i];
        const piece = row[0]?.transcript ?? "";
        if (row.isFinal) finals += piece;
        else interim += piece;
      }
      setDraft(dictationBaselineRef.current + finals + interim);
    };

    rec.onerror = () => {
      setMicError("No se pudo usar el micrófono.");
      setMicListening(false);
      recognitionRef.current = null;
    };

    rec.onend = () => {
      setMicListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current = rec;
      rec.start();
      setMicListening(true);
    } catch {
      setMicError("Permiso de micrófono rechazado o no disponible.");
      recognitionRef.current = null;
      setMicListening(false);
    }
  }, [draft, micListening, stopMic]);

  const submitConsult = React.useCallback(
    async (rawQuestion: string, opts?: { cannedReply?: string }) => {
      const q = rawQuestion.trim();
      if (!q || isReplying) return;

      const preset = opts?.cannedReply ?? getSkillsPredefinedExactReply(q);
      const isCanned = preset !== null;

      stopMic();

      const userMsg: ChatMsg = { id: uid(), role: "user", content: q };
      const assistantId = uid();

      const historyPayload: GeminiHistoryTurn[] = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: "assistant",
          content: isCanned ? preset : "",
          streaming: !isCanned,
        },
      ]);
      setDraft("");

      if (isCanned) {
        return;
      }

      setIsReplying(true);
      try {
        const res = await fetch("/api/servicio-cliente/skill-consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: selectedRole,
            question: q,
            history: historyPayload.slice(-8),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const reply = data.reply ?? "";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: reply || "*(Sin contenido)*", streaming: false } : m
          )
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error de red";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `**No se pudo obtener respuesta.** ${msg}`, streaming: false }
              : m
          )
        );
      } finally {
        setIsReplying(false);
      }
    },
    [isReplying, messages, selectedRole, stopMic]
  );

  const sendMessage = React.useCallback(() => {
    void submitConsult(draft);
  }, [draft, submitConsult]);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Users className="h-4 w-4 text-[#4a7c59]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4a7c59]">
            Selección de SKILL
          </span>
        </div>
        <p className="mb-3 text-sm text-gray-600">
          Chat de texto con el rol seleccionado. Opcional: micrófono solo para dictar en el campo de mensaje (no hay llamada
          ni audio del modelo).
        </p>
        <div className="flex flex-wrap gap-2">
          {SKILL_ROLE_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              variant={selectedRole === id ? "default" : "outline"}
              size="sm"
              disabled={isReplying}
              className={
                selectedRole === id
                  ? "rounded-full bg-[#4a7c59] font-semibold hover:bg-[#3f6b4c]"
                  : "rounded-full font-medium"
              }
              onClick={() => onRoleChange(id)}
            >
              {SKILL_ROLE_LABELS[id]}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[#BBE795]/55 bg-[#fafcf8] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6abf1a]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4a7c59]">
            Prompt assistant · ideas de preguntas
          </span>
        </div>
        <p className="mb-4 text-[11px] text-gray-500">
          Perfil activo: <strong className="text-[#1a1a1a]">{SKILL_ROLE_LABELS[selectedRole]}</strong>
        </p>

        <ul className="mb-5 grid gap-3 lg:grid-cols-2">
          {SKILLS_PREDEFINED_QUESTION_LABELS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={isReplying}
                className="group w-full rounded-lg border border-[#BBE795]/35 bg-white px-3 py-3 text-left shadow-sm ring-1 ring-transparent transition hover:border-[#BBE795]/60 hover:bg-[#F0FEE6]/40 hover:ring-[#BBE795]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]/35 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setDraft(item.prompt)}
              >
                <Badge
                  variant="secondary"
                  className="mb-2 px-2 py-0 text-[10px] font-semibold uppercase group-hover:bg-[#BBE795]/30"
                >
                  {item.label}
                </Badge>
                <p className="text-[11px] leading-snug text-gray-700">{item.prompt}</p>
              </button>
            </li>
          ))}
        </ul>

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">Más ideas por perfil</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {hints.map((item) => (
            <li
              key={item.topic}
              className="rounded-lg border border-white/80 bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100/90"
            >
              <Badge variant="secondary" className="mb-2 px-2 py-0 text-[10px] font-semibold uppercase">
                {item.topic}
              </Badge>
              <p className="text-[11px] leading-snug text-gray-600">{item.ejemplo}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-[#fafcf8] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#1a1a1a]">
            <MessageSquare className="h-4 w-4 text-[#4a7c59]" aria-hidden />
            Consulta SKILLS · solo chat
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Pulsa una idea de preguntas para llevarla al campo y envía con Enter. Micrófono = dictado al texto.
          </p>
        </div>

        <div className="flex max-h-[min(420px,52vh)] flex-col">
          <div className="min-h-[200px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {messages.length === 0 && (
              <p className="rounded-lg border border-dashed border-[#BBE795]/40 bg-[#F0FEE6]/20 px-4 py-8 text-center text-sm text-gray-500">
                Usa las ideas de preguntas arriba, dicta o escribe aquí; al enviar, el SKILL responde en el hilo.
              </p>
            )}
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const assistantStreaming = m.role === "assistant" && m.streaming;
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[min(100%,34rem)] rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ${
                      isUser
                        ? "bg-[#4a7c59] text-white ring-[#4a7c59]/30"
                        : "bg-[#fafcf8] text-[#1a1a1a] ring-[#BBE795]/35"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className="border-none bg-[#BBE795]/50 text-[11px] font-semibold text-[#2d5a3d]">
                          {SKILL_ROLE_LABELS[selectedRole]}
                        </Badge>
                        {assistantStreaming && (
                          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[#6abf1a]">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                            Generando…
                          </span>
                        )}
                      </div>
                    )}
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    ) : (
                      <div className="streamdown-chat max-w-none text-[13px] leading-relaxed [&_.streamdown]:text-[13px]">
                        <Streamdown
                          mode="streaming"
                          isAnimating={assistantStreaming && i === messages.length - 1}
                          parseIncompleteMarkdown
                          className="text-[13px] leading-relaxed"
                        >
                          {m.content || "…"}
                        </Streamdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={micListening ? "default" : "outline"}
                size="icon"
                disabled={isReplying}
                className={`h-auto min-h-[72px] w-11 shrink-0 rounded-xl ${
                  micListening ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                title={micListening ? "Detener dictado" : "Dictar con el micrófono"}
                aria-pressed={micListening}
                onClick={() => toggleMic()}
              >
                {micListening ? <MicOff className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
              </Button>
              <Textarea
                value={draft}
                onChange={(ev) => setDraft(ev.target.value)}
                placeholder="Escribe o dicta una consulta… (Enter envía, Shift+Enter salto)"
                disabled={isReplying}
                rows={2}
                className="min-h-[72px] flex-1 resize-none rounded-xl border-gray-200 bg-[#fafafa] text-sm focus-visible:ring-[#BBE795]"
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" && !ev.shiftKey) {
                    ev.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                type="button"
                disabled={isReplying || !draft.trim()}
                className="h-auto min-h-[72px] shrink-0 rounded-xl bg-[#4a7c59] px-4 font-semibold hover:bg-[#3f6b4c]"
                onClick={() => sendMessage()}
              >
                {isReplying ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <SendHorizontal className="h-5 w-5" aria-hidden />
                )}
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
            {micListening && (
              <p className="mt-2 text-[11px] font-medium text-[#4a7c59]">
                Escuchando… Habla con claridad; el texto aparece arriba. Pulsa el micrófono otra vez para parar.
              </p>
            )}
            {micError && <p className="mt-2 text-[11px] text-red-600">{micError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
