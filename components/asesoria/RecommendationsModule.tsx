"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  evaluateClientRecommendations,
  formatRetirosPct,
  type ClientRecommendationRule,
} from "@/lib/asesoria/clientRecommendationsEngine";
import {
  normalizeSimulatedClient,
  type SimulatedClientPosition,
} from "@/lib/asesoria/simulatedClientData";

type RecommendationsModuleProps = {
  cliente: SimulatedClientPosition;
};

type Phase = "idle" | "loading" | "revealed";

function formatPosicionHablada(valor: number): string {
  const millones = Math.floor(valor / 1_000_000);
  const miles = Math.floor((valor % 1_000_000) / 1_000);
  if (millones > 0 && miles > 0) {
    return `${millones} millones ${miles} mil pesos colombianos`;
  }
  if (millones > 0) {
    return `${millones} millones de pesos colombianos`;
  }
  if (miles > 0) {
    return `${miles} mil pesos colombianos`;
  }
  return `${valor} pesos colombianos`;
}

function RuleIcon({ id }: { id: ClientRecommendationRule["id"] }) {
  if (id === "traslado_total_cxc_6_12") return <ArrowRightLeft className="h-5 w-5 text-[#4a7c59]" />;
  if (id === "traslado_total_cxc_aumento_20") return <TrendingUp className="h-5 w-5 text-[#4a7c59]" />;
  return <Sparkles className="h-5 w-5 text-[#4a7c59]" />;
}

function RuleCard({ rule, variant }: { rule: ClientRecommendationRule; variant: "active" | "list" }) {
  const isActive = rule.aplica;
  return (
    <article
      className={`rounded-xl border p-4 transition-all ${
        isActive
          ? "border-[#4a7c59]/40 bg-gradient-to-br from-[#F0FEE6]/80 to-white shadow-sm ring-1 ring-[#BBE795]/30"
          : "border-gray-200 bg-gray-50/50"
      } ${variant === "list" ? "space-y-3" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-[#4a7c59]/10" : "bg-gray-100"}`}>
          <RuleIcon id={rule.id} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{rule.titulo}</h4>
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4a7c59] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <CheckCircle2 className="h-3 w-3" />Aplica
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                <CircleDashed className="h-3 w-3" />No aplica
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{rule.sugerencia}</p>
          {rule.valorAumentoLabel && (
            <p className="inline-flex rounded-md bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/50">
              {rule.valorAumentoLabel}
            </p>
          )}
          <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Regla</p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{rule.condicion}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function RecommendationsModule({ cliente }: RecommendationsModuleProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [allOpen, setAllOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const client = useMemo(() => normalizeSimulatedClient(cliente), [cliente]);
  const { active, all } = useMemo(() => evaluateClientRecommendations(client), [client]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleStop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const handleReveal = useCallback(async () => {
    if (!active || phase === "loading") return;

    if (phase === "revealed") {
      handleStop();
      setPhase("idle");
      return;
    }

    const limpiar = (s: string) =>
      s
        .replace(/\$\s?([\d.]+)/g, (_, num) => {
          const valor = parseInt(num.replace(/\./g, ""), 10);
          return formatPosicionHablada(valor);
        })
        .replace(/CxC/g, "C por C");

    const posicionHablada = formatPosicionHablada(client.posicionActual);
    const fondoHablado = limpiar(client.fondo);
    const retiros = Math.round(client.retirosCapitalPct);
    const titulo = limpiar(active.titulo);
    const sugerencia = limpiar(active.sugerencia);
    const condicion = limpiar(active.condicion);
    const valorAumento = active.valorAumentoLabel
      ? limpiar(active.valorAumentoLabel) + "."
      : "";

    const texto =
      `Basado en la información del cliente, ${client.nombre}, ` +
      `con una posición actual de ${posicionHablada}, ` +
      `en el fondo ${fondoHablado}, ` +
      `con una permanencia de ${client.tiempoPermanenciaMeses} meses, ` +
      `y retiros del ${retiros} por ciento del capital. ` +
      `La recomendación es la siguiente. ` +
      `${titulo}. ` +
      `${sugerencia}. ` +
      `${valorAumento} ` +
      `El motivo de esta recomendación es el siguiente. ` +
      `${condicion}`;

    setPhase("loading");
    try {
      const res = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texto }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
      };
      audio.onerror = () => setIsSpeaking(false);

      // Mostrar panel y reproducir simultáneamente
      setPhase("revealed");
      await audio.play();
    } catch (err) {
      console.error("[TTS]", err);
      setPhase("idle");
    }
  }, [active, phase, client, handleStop]);

  return (
    <>
      {/* Botón de alerta redondo — estado idle */}
      {active && phase === "idle" && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={handleReveal}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-300 opacity-60" />
            <span className="absolute inset-[-6px] animate-pulse rounded-full border-2 border-amber-300 opacity-40" />
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
        </div>
      )}

      {/* Animación de carga */}
      {phase === "loading" && (
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <div className="flex flex-col items-center gap-5 px-6 py-10">
            {/* Spinner con anillos */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-200 opacity-50" />
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-amber-200 border-t-amber-400" />
              <svg className="relative h-7 w-7 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>

            {/* Texto animado */}
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-700">
                Cargando la recomendación
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="animate-bounce text-amber-500" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce text-amber-500" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce text-amber-500" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </p>
            </div>

            {/* Barra de progreso animada */}
            <div className="w-48 h-1.5 rounded-full bg-amber-100 overflow-hidden">
              <div className="loading-bar h-full w-full rounded-full bg-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* Panel de recomendación — solo cuando está revealed */}
      {phase === "revealed" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#4a7c59]/8 via-[#F0FEE6]/40 to-white px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4a7c59] shadow-sm">
                  {isSpeaking ? (
                    <Volume2 className="h-5 w-5 animate-pulse text-white" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Recomendaciones</h3>
                  <p className="text-xs text-gray-500">
                    {isSpeaking ? "Reproduciendo recomendación…" : "Sugerencia comercial activa"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAllOpen(true)}
                  className="border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#F0FEE6]/60"
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Ver todas
                </Button>
                <button
                  type="button"
                  onClick={() => { handleStop(); setPhase("idle"); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  <CircleDashed className="h-3.5 w-3.5" />
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Permanencia: {client.tiempoPermanenciaMeses} meses
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Retiros: {formatRetirosPct(client.retirosCapitalPct)}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Fondo actual: {client.fondo}
              </span>
            </div>

            {active ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4a7c59]">
                  Opción recomendada
                </p>
                <RuleCard rule={active} variant="active" />
                <div className="rounded-lg border border-[#BBE795]/40 bg-[#F0FEE6]/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#4a7c59]">
                    Por qué esta recomendación
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">{active.condicion}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-8 text-center">
                <CircleDashed className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">
                  Ninguna regla aplica con el perfil actual del cliente
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-[#4a7c59]" />
              Todas las sugerencias comerciales
            </DialogTitle>
            <DialogDescription>
              Reglas de recomendación FIC Abierto → FIC CxC según permanencia y retiros de capital.
              La regla marcada como &quot;Aplica&quot; es la activa para este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-600">
                <strong className="text-gray-800">{client.nombre}</strong> ·{" "}
                {client.tiempoPermanenciaMeses} meses · {formatRetirosPct(client.retirosCapitalPct)}
              </span>
            </div>
            {all.map((rule) => (
              <RuleCard key={rule.id} rule={rule} variant="list" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
