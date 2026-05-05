"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MEETING_CONCLUSIONS,
  SIMULATED_MEETING_TRANSCRIPT,
  type MeetingUtterance,
} from "@/lib/servicio-cliente/meetingSimulated";
import { HNW_CLIENT_DEMO } from "@/lib/servicio-cliente/hnwAlejandroReport";

function ChatBubble({ line }: { line: MeetingUtterance }) {
  const isAsesor = line.speaker === "asesor";
  return (
    <div className={`flex w-full ${isAsesor ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[min(100%,34rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ${
          isAsesor
            ? "rounded-tl-sm bg-[#f4faf6] text-[#1a231c] ring-[#BBE795]/40"
            : "rounded-tr-sm bg-[#1a231c] text-white/95 ring-[#1a231c]"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          {isAsesor ? (
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#4a7c59]" aria-hidden />
          ) : (
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#BBE795]" aria-hidden />
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              isAsesor ? "text-[#4a7c59]" : "text-[#BBE795]"
            }`}
          >
            {line.badge}
          </span>
        </div>
        <p className={isAsesor ? "text-gray-800" : "text-white/92"}>&ldquo;{line.text}&rdquo;</p>
      </div>
    </div>
  );
}

export function ReunionSimuladaChat() {
  const [showConclusions, setShowConclusions] = useState(false);
  const conclusionsRef = useRef<HTMLDivElement>(null);

  const revealConclusions = useCallback(() => {
    setShowConclusions(true);
  }, []);

  useEffect(() => {
    if (!showConclusions) return;
    const id = requestAnimationFrame(() => {
      conclusionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [showConclusions]);

  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-[#fafcf8]">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-5 w-5 text-[#4a7c59]" aria-hidden />
          <CardTitle className="text-lg">Sesión trimestral simulada</CardTitle>
        </div>
        <CardDescription>
          Videoconferencia · {HNW_CLIENT_DEMO.nombre} · formato chat demo · ~50 minutos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <section>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
            3.2 · Transcripción simulada de la reunión
          </h3>
          <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-4 sm:p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {SIMULATED_MEETING_TRANSCRIPT.map((line, i) => (
                <ChatBubble key={i} line={line} />
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="rounded-xl bg-[#4a7c59] px-8 font-semibold shadow-sm hover:bg-[#3f6b4c]"
            onClick={revealConclusions}
            disabled={showConclusions}
          >
            {showConclusions ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Conclusiones visibles
              </>
            ) : (
              "Sacar conclusiones de la reunión"
            )}
          </Button>
          {!showConclusions && (
            <p className="max-w-md text-center text-xs text-gray-500">
              Resume los acuerdos y próximos pasos tras revisar el diálogo simulado.
            </p>
          )}
        </div>

        {showConclusions && (
          <section ref={conclusionsRef} className="scroll-mt-24 animate-in fade-in duration-300 rounded-xl border border-[#BBE795]/45 bg-[#F0FEE6]/35 p-5 sm:p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              3.3 · Conclusiones de la reunión
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#1a231c]">
              {MEETING_CONCLUSIONS.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4a7c59]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
