"use client";

import { MessageSquare, Mic, Sparkles, Square, Users } from "lucide-react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildCustomerSupportContextFromHnw } from "@/lib/servicio-cliente/customerSupportVoiceContext";
import { SKILL_ROLE_IDS, SKILL_ROLE_LABELS, type SkillRoleId } from "@/lib/servicio-cliente/knowledgeBase";
import { SKILL_VOICE_HINTS } from "@/lib/servicio-cliente/skillsVoiceHints";

const VOICE_CONTEXT = buildCustomerSupportContextFromHnw();

type Props = {
  selectedRole: SkillRoleId;
  onRoleChange: (role: SkillRoleId) => void;
};

export function AdvisorSkillsVoice({ selectedRole, onRoleChange }: Props) {
  const { startSession, endSession, isConnected, isConnecting, isSpeaking, error } = useVoiceAgent({
    voiceName: "Zephyr",
    mode: "customer_support",
    customerSupportContext: VOICE_CONTEXT,
    skillConsultRole: selectedRole,
  });

  const busy = isConnecting || isConnected;
  const hints = SKILL_VOICE_HINTS[selectedRole];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Users className="h-4 w-4 text-[#4a7c59]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4a7c59]">
            Selección de SKILL (antes de hablar)
          </span>
        </div>
        <p className="mb-3 text-sm text-gray-600">
          Elige el rol interno que quieres consultar por voz. Finaliza la llamada si necesitas cambiar de perfil.
        </p>
        <div className="flex flex-wrap gap-2">
          {SKILL_ROLE_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              variant={selectedRole === id ? "default" : "outline"}
              size="sm"
              disabled={busy}
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
            Ideas de preguntas — dilas en voz al micrófono
          </span>
        </div>
        <p className="mb-3 text-[11px] text-gray-500">
          Perfil activo: <strong className="text-[#1a1a1a]">{SKILL_ROLE_LABELS[selectedRole]}</strong>
        </p>
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

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#1a1a1a]">
          <Mic className="h-4 w-4 text-[#4a7c59]" aria-hidden />
          Consulta SKILLS por voz · Gemini Live
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Misma experiencia que consultas ad hoc: solo audio. Habla como asesor comercial preguntando al experto seleccionado.
        </p>

        <VoicePulse speaking={isSpeaking} />

        <div className="mt-6 flex justify-center">
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
              {isSpeaking ? "Skill · hablando" : "Micrófono · escucha activa"}
            </span>
          ) : (
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
              Listo · SKILL: {SKILL_ROLE_LABELS[selectedRole]}
            </span>
          )}
        </div>

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex justify-center gap-3">
          {isConnecting ? (
            <Button disabled variant="outline" className="h-10 rounded-lg px-6">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Conectando…
            </Button>
          ) : !isConnected ? (
            <Button
              type="button"
              onClick={startSession}
              className="h-10 rounded-lg bg-[#4a7c59] px-6 font-semibold text-white shadow-sm transition-all hover:bg-[#3f6b4c] hover:shadow-md"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Hablar con el SKILL seleccionado
            </Button>
          ) : (
            <Button
              type="button"
              onClick={endSession}
              variant="outline"
              className="h-10 rounded-lg border-red-200 bg-red-50 px-5 font-semibold text-red-700 hover:bg-red-100"
            >
              <Square className="mr-2 h-3 w-3 fill-current" />
              Finalizar llamada
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
