"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Loader2,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  razonSocial: string;
  onNext: () => void;
  onBack: () => void;
}

type Phase = "pulse" | "lists" | "pep" | "done";

const SOURCES: { key: string; title: string; detail: string }[] = [
  { key: "ofac", title: "OFAC", detail: "Sanciones EE.UU. / SDN" },
  { key: "onu", title: "ONU", detail: "Lista consolidada de sanciones" },
  { key: "interp", title: "INTERPOL", detail: "Alertas y órganos especializados" },
  { key: "fis", title: "Fiscalía Colombia", detail: "Listas y alertas locales" },
  { key: "clinton", title: "Clinton / PLAFT histórico", detail: "Cruce normativo nacional" },
  { key: "fondeli", title: "FONDELIBERTAD", detail: "Terrorismo y financiación" },
  { key: "eu", title: "Unión Europea", detail: "Sanciones consolidadas UE" },
  { key: "gafilat", title: "GAFILAT / AML regional", detail: "Referencias LA/FT" },
];

export function RestrictedListsSimulationStep({ razonSocial, onNext, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("pulse");
  const [scanningIdx, setScanningIdx] = useState<number | null>(null);
  const [clearedThru, setClearedThru] = useState(-1);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("lists"), 620);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "lists") return;
    let i = 0;
    const timers: number[] = [];

    const runRow = () => {
      setScanningIdx(i);
      timers.push(
        window.setTimeout(() => {
          setClearedThru(i);
          i += 1;
          if (i >= SOURCES.length) {
            setScanningIdx(null);
            timers.push(window.setTimeout(() => setPhase("pep"), 380) as unknown as number);
          } else {
            runRow();
          }
        }, 400) as unknown as number
      );
    };
    runRow();

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [phase]);

  useEffect(() => {
    if (phase !== "pep") return;
    const t = window.setTimeout(() => {
      setPhase("done");
      setCanContinue(true);
    }, 2100);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 -ml-2 text-gray-600" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#2d4a36]/60 bg-gradient-to-br from-[#0b140e] via-[#12261a] to-[#0b140e] text-white shadow-[0_0_60px_-12px_rgba(74,124,89,0.55)]">
        <div className="pointer-events-none absolute -inset-[40%] sarlaft-conic-spin opacity-40" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(187,231,149,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 sarlaft-grid-pan opacity-[0.07]" aria-hidden />

        <div className="relative p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BBE795]/20 ring-1 ring-[#BBE795]/40">
              <Radar className="h-6 w-6 text-[#BBE795] sarlaft-icon-pulse" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#BBE795]/90">
                Fase 4 · SARLAFT
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
                Consulta listas restrictivas + verificación PEP
              </h2>
              <p className="mt-2 text-sm text-white/65 leading-relaxed max-w-xl">
                Consulta paralela simulada en OFAC, ONU, INTERPOL, Fiscalía, Clinton, FONDELIBERTAD, UE y
                GAFILAT. PEP y debida diligencia reforzada (EDD) con referencias a Circular 026/2008 y decreto de
                estructura de administración financiera relacionado — Decreto 1674 de 2021 (demostración).
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-[#BBE795] shrink-0 opacity-80 sarlaft-icon-pulse" aria-hidden />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-xs font-mono text-[#BBE795]/85 space-y-1">
            <p>
              &gt; sujeto:{" "}
              <span className="text-white/90">{razonSocial.trim() || "[razón social]"}</span>
            </p>
            <p className="text-white/50">
              &gt; motor: paralelo simulado · latencia efectiva{" "}
              <span className="text-white/70">{phase === "lists" ? "activa…" : "inactiva"}</span>
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {SOURCES.map((s, idx) => {
              const done = clearedThru >= idx;
              const active = scanningIdx === idx && phase === "lists";
              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-300 ${
                    done
                      ? "border-[#BBE795]/45 bg-[#BBE795]/12"
                      : active
                        ? "border-[#BBE795]/55 bg-[#BBE795]/08 sarlaft-row-glow"
                        : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="shrink-0">
                    {done ? (
                      <BadgeCheck className="h-5 w-5 text-[#BBE795]" aria-hidden />
                    ) : active ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#BBE795]" aria-hidden />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-white/25" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight">{s.title}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {(phase === "pep" || phase === "done") && (
            <div
              className={`rounded-xl border border-[#BBE795]/35 bg-[#BBE795]/08 p-4 sm:p-5 space-y-3 animate-in fade-in zoom-in-95 duration-500 ${
                phase === "pep" ? "sarlaft-pep-intro" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-[#BBE795]">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  PEP y debida diligencia reforzada (EDD)
                </span>
              </div>
              <p className="text-sm text-white/85 leading-relaxed">
                Representante legal y beneficiarios finales{" "}
                <strong className="text-[#BBE795]">no figuran como PEP</strong> en las fuentes consultadas (simulación).
                Perfil LA/FT: <strong className="text-white">medio‑bajo</strong>.{" "}
                <span className="text-white/60">
                  Si se identifica PEP u operaciones relacionadas con listas, se escala según régimen EDD institucional
                  y Circular 026/2008 (simulación).
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85 ring-1 ring-white/15">
                  <Scale className="h-3 w-3 opacity-70" aria-hidden />
                  Circular 026/2008
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85 ring-1 ring-white/15">
                  <Scale className="h-3 w-3 opacity-70" aria-hidden />
                  Decreto 1674/2021
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="gap-1.5 rounded-xl bg-[#4a7c59] hover:bg-[#3d6949] disabled:opacity-40"
        >
          Continuar al asesor
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!canContinue && (
        <p className="text-center text-[11px] text-gray-400">
          Espera unos segundos mientras se completa la simulación de consultas…
        </p>
      )}
    </div>
  );
}
