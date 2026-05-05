"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Scale } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { ASSET_ALLOCATION, PORTFOLIO_OPTIONS } from "@/lib/portfolio/portfolioData";

const benchmarkOption = PORTFOLIO_OPTIONS.find((o) => o.id === "benchmark")!;
const scenarioOptions = PORTFOLIO_OPTIONS.filter((o) => o.id !== "benchmark");

function formatPct(n: number): string {
  return `${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} %`;
}

function formatPp(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(delta)} pp`;
}

function formatSignedMetricDelta(delta: number): string {
  if (delta === 0) return formatPct(0);
  const sign = delta > 0 ? "+" : "−";
  const abs = Math.abs(delta);
  return `${sign}${formatPct(abs)}`;
}

function weightRow(row: (typeof ASSET_ALLOCATION)[number], scenarioId: string): number {
  switch (scenarioId) {
    case "benchmark":
      return row.bmkActual;
    case "portfolio32":
      return row.portfolio32;
    case "portfolio33":
      return row.portfolio33;
    case "portfolio36":
      return row.portfolio36;
    default:
      return 0;
  }
}

const METRIC_LABELS: { key: keyof (typeof benchmarkOption)["metrics"]; label: string }[] = [
  { key: "expectedReturn", label: "Retorno esperado" },
  { key: "volatility", label: "Volatilidad" },
  { key: "maxDrawdown", label: "Max. caída" },
  { key: "trm", label: "TRM (escenario)" },
];

function useRevealTrigger(dep: string | null) {
  const [reveal, setReveal] = React.useState(false);

  React.useEffect(() => {
    setReveal(false);
    const t = window.setTimeout(() => setReveal(true), 80);
    return () => window.clearTimeout(t);
  }, [dep]);

  return reveal;
}

function ComparativaAnimada({
  selectedId,
  selectedName,
  visibleAssets,
}: {
  selectedId: string;
  selectedName: string;
  visibleAssets: typeof ASSET_ALLOCATION;
}) {
  const reveal = useRevealTrigger(selectedId);
  const selected = scenarioOptions.find((o) => o.id === selectedId)!;

  return (
    <div
      key={selectedId}
      className="overflow-hidden rounded-2xl border-2 border-[#BBE795]/40 bg-gradient-to-br from-[#fafcf8] via-white to-[#F0FEE6]/35 p-4 shadow-inner shadow-[#BBE795]/10 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
            Comparativa animada
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1a1a1a]">
            Actual vs <span className="text-[#4a7c59]">{selectedName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#BBE795]/35 bg-white/90 px-3 py-2 text-xs shadow-sm">
          <span className="rounded-lg bg-gray-200/90 px-2.5 py-1 font-semibold text-gray-800">Portafolio actual</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#6abf1a] motion-safe:animate-pulse" aria-hidden />
          <span className="rounded-lg bg-[#4a7c59] px-2.5 py-1 font-semibold text-white">{selectedName}</span>
        </div>
      </div>

      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_LABELS.map(({ key, label }, i) => {
          const cur = benchmarkOption.metrics[key];
          const next = selected.metrics[key];
          const delta = next - cur;
          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border border-gray-100 bg-white/95 p-3 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both",
              )}
              style={{
                animationDelay: reveal ? `${i * 70}ms` : "0ms",
                animationDuration: "450ms",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="tabular-nums text-lg font-bold text-[#4a7c59]">{formatPct(next)}</span>
                <span className="text-[11px] text-gray-400">{formatPct(cur)} actual</span>
              </div>
              <p
                className={cn(
                  "mt-1 text-[11px] font-semibold tabular-nums",
                  delta > 0 ? "text-emerald-700" : delta < 0 ? "text-amber-800" : "text-gray-500",
                )}
              >
                {formatSignedMetricDelta(delta)} vs actual
              </p>
            </div>
          );
        })}
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
        Asignación por activo (barras)
      </p>
      <ul className="space-y-3">
        {visibleAssets.map((row, rowIdx) => {
          const base = weightRow(row, "benchmark");
          const prop = weightRow(row, selectedId);
          const delayMs = rowIdx * 45;
          return (
            <li key={row.asset} className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#1a1a1a]">{row.asset}</span>
                <span className="text-[11px] tabular-nums text-gray-500">
                  {formatPct(base)} → <span className="font-semibold text-[#4a7c59]">{formatPct(prop)}</span>
                  <span className="ml-1 text-gray-400">({formatPp(prop - base)})</span>
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Actual</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-500 transition-[width] duration-700 ease-out"
                      style={{
                        width: reveal ? `${Math.min(100, Math.max(0, base))}%` : "0%",
                        transitionDelay: `${delayMs}ms`,
                      }}
                    />
                  </div>
                </div>
                <ArrowRight className="mx-auto hidden h-4 w-4 shrink-0 text-[#BBE795] sm:block" aria-hidden />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#4a7c59]">{selectedName}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#F0FEE6] ring-1 ring-[#BBE795]/40">
                    <div
                      className="h-full rounded-full bg-[#4a7c59] transition-[width] duration-700 ease-out"
                      style={{
                        width: reveal ? `${Math.min(100, Math.max(0, prop))}%` : "0%",
                        transitionDelay: `${delayMs + 120}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ServicioClienteFase4Rebalance() {
  const [selectedId, setSelectedId] = React.useState<string | null>(scenarioOptions[0]?.id ?? null);

  const visibleAssets = React.useMemo(
    () =>
      ASSET_ALLOCATION.filter(
        (row) =>
          row.bmkActual > 0.01 ||
          row.portfolio32 > 0.01 ||
          row.portfolio33 > 0.01 ||
          row.portfolio36 > 0.01
      ),
    []
  );

  const selected = scenarioOptions.find((o) => o.id === selectedId);

  return (
    <div className="space-y-6">
      <Card className="border-[#BBE795]/35 shadow-sm">
        <CardHeader className="border-b border-[#BBE795]/20 bg-[#fafcf8] pb-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0FEE6] ring-1 ring-[#BBE795]/40">
              <Scale className="h-5 w-5 text-[#4a7c59]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">Rebalanceo · comparativa de escenarios (Q2 2026 demo)</CardTitle>
              <CardDescription className="mt-1.5 text-sm">
                Elige un portafolio sugerido; se resalta en tarjeta y aparece la comparativa animada frente al actual.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              Selecciona un portafolio
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {scenarioOptions.map((opt) => {
                const active = selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedId(opt.id)}
                    className={cn(
                      "relative flex aspect-square max-h-[200px] flex-col justify-between rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]/45 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:fill-mode-both sm:aspect-auto sm:max-h-none sm:min-h-[168px]",
                      active
                        ? "scale-[1.02] border-[#4a7c59] shadow-lg shadow-[#BBE795]/25 ring-2 ring-[#BBE795]/60 ring-offset-2 ring-offset-[#fafcf8]"
                        : "border-gray-200/90 hover:scale-[1.01] hover:border-[#BBE795]/80 hover:shadow-md",
                    )}
                  >
                    {active ? (
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#4a7c59] text-white shadow-md motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                    ) : null}
                    <div>
                      <p className="pr-10 text-sm font-bold text-[#1a1a1a]">{opt.name}</p>
                      <p className="mt-2 text-xs leading-snug text-gray-600">{opt.description}</p>
                    </div>
                    <span
                      className={cn(
                        "mt-3 inline-flex w-fit rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                        active ? "bg-[#F0FEE6] text-[#2d5a3d] ring-1 ring-[#BBE795]/50" : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {active ? "Seleccionado" : "Toca para comparar"}
                    </span>
                  </button>
                );
              })}
            </div>
            {selected && (
              <p className="mt-4 rounded-xl border border-dashed border-[#BBE795]/50 bg-[#F0FEE6]/20 px-4 py-3 text-sm text-gray-700">
                <span className="font-semibold text-[#1a1a1a]">Propuesta activa: </span>
                {selected.name}
                <span className="text-gray-500"> — </span>
                {selected.description}
              </p>
            )}
          </div>

          {selectedId && selected ? (
            <ComparativaAnimada
              selectedId={selectedId}
              selectedName={selected.name}
              visibleAssets={visibleAssets}
            />
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              Métricas del escenario (fuente · portfolioMetrics.json)
            </p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Métrica</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  {scenarioOptions.map((opt) => (
                    <TableHead key={opt.id} className="text-right">
                      {opt.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {METRIC_LABELS.map(({ key, label }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell className="text-right tabular-nums text-gray-600">
                      {formatPct(benchmarkOption.metrics[key])}
                    </TableCell>
                    {scenarioOptions.map((opt) => (
                      <TableCell key={opt.id} className="text-right tabular-nums">
                        <span className={opt.id === selectedId ? "font-semibold text-[#4a7c59]" : "text-gray-800"}>
                          {formatPct(opt.metrics[key])}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              Asignación por activo vs actual (fuente · assetAllocation.json)
            </p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[12rem]">Activo</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  {scenarioOptions.map((opt) => (
                    <TableHead key={opt.id} className="text-right">
                      {opt.name}
                    </TableHead>
                  ))}
                  <TableHead className="w-[6rem] text-right text-[11px] font-normal text-gray-500">
                    Δ vs actual ({selected?.name ?? "—"})
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAssets.map((row) => {
                  const base = weightRow(row, "benchmark");
                  return (
                    <TableRow key={row.asset}>
                      <TableCell className="font-medium">{row.asset}</TableCell>
                      <TableCell className="text-right tabular-nums text-gray-600">{formatPct(base)}</TableCell>
                      {scenarioOptions.map((opt) => {
                        const w = weightRow(row, opt.id);
                        const isSel = opt.id === selectedId;
                        return (
                          <TableCell key={opt.id} className="text-right tabular-nums">
                            <span className={isSel ? "font-semibold text-[#4a7c59]" : "text-gray-800"}>
                              {formatPct(w)}
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right tabular-nums text-sm text-gray-600">
                        {selected ? formatPp(weightRow(row, selected.id) - base) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-xs text-gray-500">
            <span>Demo ilustrativa · sin ejecución ni envío a mesa.</span>
            <Link
              href="/portfolio"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg text-[11px]")}
            >
              Abrir portafolios (Front Office)
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
