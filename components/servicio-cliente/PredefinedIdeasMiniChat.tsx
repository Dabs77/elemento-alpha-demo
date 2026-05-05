"use client";

import * as React from "react";
import { Loader2, MessageSquare, SendHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_ROLE_LABELS, type SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";
import { getSkillsPredefinedExactReply } from "@/lib/servicio-cliente/skillConsultPredefinedQA";

type Line = { id: string; role: "user" | "assistant"; content: string };

export type PredefinedIdeasMiniChatHandle = {
  submitPrompt: (prompt: string, cannedReply?: string) => void;
};

export const PredefinedIdeasMiniChat = React.forwardRef<
  PredefinedIdeasMiniChatHandle,
  { selectedRole: SkillRoleId; onClearMainDraft?: () => void }
>(function PredefinedIdeasMiniChat({ selectedRole, onClearMainDraft }, ref) {
    const [lines, setLines] = React.useState<Line[]>([]);
    const [busy, setBusy] = React.useState(false);
    const [draft, setDraft] = React.useState("");
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const linesRef = React.useRef<Line[]>([]);

    React.useEffect(() => {
      setLines([]);
      linesRef.current = [];
      setDraft("");
    }, [selectedRole]);

    React.useEffect(() => {
      linesRef.current = lines;
    }, [lines]);

    React.useEffect(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [lines]);

    const submitPrompt = React.useCallback(
      async (rawPrompt: string, cannedReply?: string) => {
        const q = rawPrompt.trim();
        if (!q || busy) return;

        onClearMainDraft?.();

        const userLine: Line = { id: crypto.randomUUID(), role: "user", content: q };
        const preset = cannedReply ?? getSkillsPredefinedExactReply(q);

        if (preset !== null && preset !== "") {
          const prior = linesRef.current;
          const next = [...prior, userLine, { id: crypto.randomUUID(), role: "assistant" as const, content: preset }];
          linesRef.current = next;
          setLines(next);
          return;
        }

        setBusy(true);
        const prior = linesRef.current;
        const historyPayload = prior.map((l) => ({
          role: l.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: l.content }],
        }));
        const withUser = [...prior, userLine];
        linesRef.current = withUser;
        setLines(withUser);

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
          if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
          const reply = data.reply ?? "";
          const assistantLine: Line = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply || "*(Sin contenido)*",
          };
          const done = [...withUser, assistantLine];
          linesRef.current = done;
          setLines(done);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Error de red";
          const errLine: Line = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `No se pudo obtener respuesta. ${msg}`,
          };
          const done = [...withUser, errLine];
          linesRef.current = done;
          setLines(done);
        } finally {
          setBusy(false);
        }
      },
      [busy, selectedRole, onClearMainDraft],
    );

    React.useImperativeHandle(ref, () => ({ submitPrompt }), [submitPrompt]);

    const handleSendFromField = React.useCallback(() => {
      const q = draft.trim();
      if (!q || busy) return;
      setDraft("");
      void submitPrompt(q);
    }, [draft, busy, submitPrompt]);

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-2 border-[#BBE795]/40 bg-white shadow-sm ring-1 ring-[#BBE795]/15">
        <div className="flex shrink-0 items-center gap-2 border-b border-[#BBE795]/25 bg-[#fafcf8] px-3 py-2">
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#4a7c59]" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a7c59]">Consulta rápida</span>
          <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[9px] font-semibold">
            {SKILL_ROLE_LABELS[selectedRole]}
          </Badge>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain scroll-smooth px-2 py-2"
        >
          {lines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#BBE795]/35 bg-[#F0FEE6]/15 px-2 py-3 text-center text-[10px] leading-snug text-gray-500">
              Escribe abajo y envía. También puedes pulsar una tarjeta de ideas para ver la respuesta aquí.
            </p>
          ) : (
            lines.map((ln) =>
              ln.role === "user" ? (
                <div key={ln.id} className="flex justify-end">
                  <div className="max-w-[95%] rounded-lg bg-[#4a7c59] px-2.5 py-1.5 text-[10px] leading-snug text-white shadow-sm">
                    <p className="whitespace-pre-wrap">{ln.content}</p>
                  </div>
                </div>
              ) : (
                <div key={ln.id} className="flex justify-start">
                  <div className="max-w-[98%] rounded-lg border border-[#BBE795]/40 bg-[#fafcf8] px-2.5 py-2 text-[10px] leading-snug text-[#1a1a1a] shadow-sm">
                    <p className="whitespace-pre-wrap">{ln.content}</p>
                  </div>
                </div>
              ),
            )
          )}
          {busy ? (
            <div className="flex items-center gap-1.5 px-1 text-[10px] font-medium text-[#6abf1a]">
              <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
              Generando…
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#BBE795]/20 bg-white p-2">
          <div className="flex gap-2">
            <Textarea
              value={draft}
              onChange={(ev) => setDraft(ev.target.value)}
              placeholder="Escribe tu consulta…"
              disabled={busy}
              rows={2}
              className="min-h-[52px] flex-1 resize-none rounded-lg border-gray-200 bg-[#fafafa] text-[11px] focus-visible:ring-[#BBE795]"
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  handleSendFromField();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              disabled={busy || !draft.trim()}
              className="h-auto min-h-[52px] w-10 shrink-0 rounded-lg bg-[#4a7c59] hover:bg-[#3f6b4c]"
              title="Enviar"
              onClick={() => handleSendFromField()}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <SendHorizontal className="h-4 w-4" aria-hidden />}
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

PredefinedIdeasMiniChat.displayName = "PredefinedIdeasMiniChat";
