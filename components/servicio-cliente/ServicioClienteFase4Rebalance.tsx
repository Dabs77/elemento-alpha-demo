"use client";

import * as React from "react";
import Link from "next/link";
import { Mic, Scale, Square, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VoicePulse } from "@/components/voice/VoicePulse";
import { HnwRebalanceInteractivePanels } from "@/components/servicio-cliente/HnwRebalanceInteractivePanels";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { cn } from "@/lib/utils";
import { HNW_CLIENT_DEMO } from "@/lib/servicio-cliente/hnwAlejandroReport";
import {
  buildHnwRebalanceQ2VoiceContext,
  HNW_REBALANCE_Q2_COSTS,
  HNW_REBALANCE_Q2_COSTS_TOTAL,
  HNW_REBALANCE_Q2_COSTS_TOTAL_ROW,
  HNW_REBALANCE_Q2_INTRO,
  HNW_REBALANCE_Q2_JUSTIFICATION_BULLETS,
  HNW_REBALANCE_Q2_JUSTIFICATION_LEAD,
  HNW_REBALANCE_Q2_JUSTIFICATION_TITLE,
  HNW_REBALANCE_Q2_SCHEDULE,
  HNW_REBALANCE_Q2_TITLE,
} from "@/lib/servicio-cliente/hnwRebalanceQ2FormalProposal";

export function ServicioClienteFase4Rebalance() {
  const [voicePanelOpen, setVoicePanelOpen] = React.useState(false);

  const rebalanceContext = React.useMemo(() => buildHnwRebalanceQ2VoiceContext(), []);

  const { startSession, endSession, isConnected, isConnecting, isSpeaking, error: voiceError } =
    useVoiceAgent({
      mode: "rebalance_advisor",
      rebalanceContext,
      voiceName: "Zephyr",
    });

  React.useEffect(() => {
    if (isConnected) setVoicePanelOpen(true);
  }, [isConnected]);

  React.useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return (
    <div className="relative space-y-6 pb-28 md:pb-24">
      <Card className="overflow-visible border-[#BBE795]/35 shadow-sm">
        <CardHeader className="border-b border-[#BBE795]/20 bg-[#fafcf8] pb-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0FEE6] ring-1 ring-[#BBE795]/40">
              <Scale className="h-5 w-5 text-[#4a7c59]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-snug">{HNW_REBALANCE_Q2_TITLE}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed">
                Cliente demo: <span className="font-medium text-foreground">{HNW_CLIENT_DEMO.nombre}</span>. Una única
                propuesta formal para Q2 2026. Pulsa el micrófono flotante para preguntas por voz sobre actual vs
                propuesto (igual que la vista de rebalanceo en Portafolios).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm leading-relaxed text-gray-700">{HNW_REBALANCE_Q2_INTRO}</p>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              {HNW_REBALANCE_Q2_JUSTIFICATION_TITLE}
            </h3>
            <p className="mb-2 text-sm font-medium text-[#1a1a1a]">{HNW_REBALANCE_Q2_JUSTIFICATION_LEAD}</p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
              {HNW_REBALANCE_Q2_JUSTIFICATION_BULLETS.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </section>

          <HnwRebalanceInteractivePanels />

          <section className="overflow-x-auto rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              5.4 Costos de transacción estimados
            </p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Operación</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Costo est.</TableHead>
                  <TableHead className="text-right">Impacto %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HNW_REBALANCE_Q2_COSTS.map((row) => (
                  <TableRow key={row.operacion}>
                    <TableCell className="font-medium">{row.operacion}</TableCell>
                    <TableCell className="text-right text-sm">{row.monto}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.costoEst}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.impactoPct}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-[#fafcf8] font-semibold">
                  <TableCell>{HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.operacion}</TableCell>
                  <TableCell className="text-right">{HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.monto}</TableCell>
                  <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.costoEst}</TableCell>
                  <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COSTS_TOTAL_ROW.impactoPct}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="border-t border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
              {HNW_REBALANCE_Q2_COSTS_TOTAL}
            </p>
          </section>

          <section className="overflow-x-auto rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              5.5 Cronograma de implementación
            </p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[8rem]">Día</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead className="min-w-[10rem]">Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HNW_REBALANCE_Q2_SCHEDULE.map((row) => (
                  <TableRow key={row.dia}>
                    <TableCell className="whitespace-nowrap font-medium">{row.dia}</TableCell>
                    <TableCell className="text-sm">{row.accion}</TableCell>
                    <TableCell className="text-sm text-gray-700">{row.responsable}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-xs text-gray-500">
            <span>Demo ilustrativa · sin ejecución ni envío a mesa.</span>
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg text-[11px]")}
            >
              Ver rebalanceo en Portafolios (Front Office)
            </Link>
          </div>
        </CardContent>
      </Card>

      {voicePanelOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:bg-black/10"
            aria-label="Cerrar panel del asesor"
            onClick={() => setVoicePanelOpen(false)}
          />
          <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-200 md:left-auto md:right-8 md:mx-0">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6abf1a]">Asesor por voz</p>
                <p className="text-sm font-bold leading-snug text-[#1a1a1a]">
                  Actual vs propuesto · rebalanceo Q2 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVoicePanelOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#1a1a1a]"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <VoicePulse speaking={isSpeaking} />
              <div className="flex flex-wrap justify-center gap-2">
                {voiceError ? (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
                    Error de conexión
                  </span>
                ) : isConnecting ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Conectando…
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#F0FEE6] px-3 py-1 text-xs font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/40">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4a7c59]" />
                    {isSpeaking ? "Hablando · LIVE" : "Escuchando · LIVE"}
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
                    Pulsa activar y permite el micrófono
                  </span>
                )}
              </div>
              {voiceError ? <p className="text-xs text-red-600">{voiceError}</p> : null}
              <div className="flex w-full justify-center gap-2 pt-1">
                {isConnecting ? (
                  <Button disabled variant="outline" className="h-10 flex-1 rounded-xl">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Conectando…
                  </Button>
                ) : !isConnected ? (
                  <Button
                    type="button"
                    onClick={() => void startSession()}
                    className="h-10 flex-1 gap-2 rounded-xl bg-[#4a7c59] font-semibold text-white hover:bg-[#3f6b4c]"
                  >
                    <Mic className="h-4 w-4" /> Activar micrófono
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => endSession()}
                    variant="outline"
                    className="h-10 flex-1 gap-2 rounded-xl border-red-200 bg-red-50 font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Square className="h-3 w-3 fill-current" /> Finalizar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => setVoicePanelOpen((open) => !open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6abf1a] focus-visible:ring-offset-2 ${
          isConnected
            ? "bg-[#4a7c59] shadow-[0_4px_24px_rgba(106,191,26,0.35)] ring-2 ring-[#BBE795]/90"
            : "bg-[#4a7c59] shadow-[0_8px_30px_rgba(74,124,89,0.35)] hover:bg-[#3f6b4c]"
        } ${isSpeaking ? "animate-pulse" : ""}`}
        aria-label={voicePanelOpen ? "Ocultar panel del asesor" : "Abrir preguntas por voz sobre rebalanceo"}
        aria-expanded={voicePanelOpen}
      >
        <Mic className="h-6 w-6 shrink-0" strokeWidth={2.25} />
      </button>
    </div>
  );
}
