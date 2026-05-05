"use client";

import { MessageSquare, Square, Sparkles } from "lucide-react";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildCustomerSupportContextFromHnw } from "@/lib/servicio-cliente/customerSupportVoiceContext";

const SERVICIO_CLIENTE_VOICE_CONTEXT = buildCustomerSupportContextFromHnw();

type FAQHint = { q: string; hint: string };

const FAQ_VOICE_HINTS: FAQHint[] = [
  {
    q: "ACWI COP y TRM",
    hint: 'Ej.: "¿Qué opciones tengo si quiero mitigar el golpe del peso fuerte sobre mi global?"',
  },
  {
    q: "Utilidades ICOLCAP",
    hint: 'Ej.: "¿Cómo explico tomar utilidades parciales sin que suene a timing de mercado?"',
  },
  {
    q: "IPS vs emoción",
    hint: 'Ej.: "¿Cómo le digo que salirse de todo lo global rompe su perfil moderado?"',
  },
];

export function ServicioClienteConsultasVoice() {
  const { startSession, endSession, isConnected, isConnecting, isSpeaking, error } = useVoiceAgent({
    voiceName: "Zephyr",
    mode: "customer_support",
    customerSupportContext: SERVICIO_CLIENTE_VOICE_CONTEXT,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
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
              {isSpeaking ? "Asistente · hablando" : "Micrófono · escucha activa"}
            </span>
          ) : (
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
              Listo para iniciar llamada demo
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
              Hablar con el agente (consultas ad hoc)
            </Button>
          ) : (
            <Button type="button" onClick={endSession} variant="outline" className="h-10 rounded-lg border-red-200 bg-red-50 px-5 font-semibold text-red-700 hover:bg-red-100">
              <Square className="mr-2 h-3 w-3 fill-current" />
              Finalizar llamada
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-[#BBE795]/55 bg-[#fafcf8] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6abf1a]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4a7c59]">
            Ideas de preguntas (no es chat escrito — dilas en voz)
          </span>
        </div>
        <ul className="grid gap-2 sm:grid-cols-3">
          {FAQ_VOICE_HINTS.map((item) => (
            <li
              key={item.q}
              className="rounded-md border border-white/70 bg-white/80 px-3 py-2.5 ring-1 ring-gray-100/80"
            >
              <Badge variant="secondary" className="mb-1.5 px-2 py-0 text-[10px] font-semibold uppercase">
                {item.q}
              </Badge>
              <p className="text-[11px] leading-snug text-gray-600">{item.hint}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
