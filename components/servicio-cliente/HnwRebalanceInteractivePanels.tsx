"use client";

import * as React from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Play,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  HNW_REBALANCE_Q2_ALLOCATION_CHART,
  HNW_REBALANCE_Q2_COMPARISON_TABLE,
  HNW_REBALANCE_Q2_COMPARISON_TOTAL,
  HNW_REBALANCE_Q2_IMPACT_METRICS,
  HNW_REBALANCE_Q2_IMPACT_NUMERIC,
  HNW_REBALANCE_Q2_USD_FOOTNOTE,
} from "@/lib/servicio-cliente/hnwRebalanceQ2FormalProposal";

const PALETTE = [
  "#6abf1a",
  "#BBE795",
  "#4a7c59",
  "#7dd83a",
  "#9fdb6c",
  "#c8eea8",
  "#5cb85c",
  "#8fbc8f",
];

function normalizeWeights(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum <= 0) return values;
  return values.map((v) => (v / sum) * 100);
}

type MergedAllocRow = (typeof HNW_REBALANCE_Q2_ALLOCATION_CHART)[number] & {
  activo: string;
  movimiento: string;
  pesoActual: string;
  pesoPropuesto: string;
  montoActual: string;
  montoPropuesto: string;
};

function useMergedAllocationRows(): MergedAllocRow[] {
  return React.useMemo(() => {
    const tbl = HNW_REBALANCE_Q2_COMPARISON_TABLE.filter(
      (r) => r.activo !== "Liquidez (Caja transitoria)"
    );
    return HNW_REBALANCE_Q2_ALLOCATION_CHART.map((c, i) => ({
      ...c,
      activo: tbl[i]?.activo ?? c.labelShort,
      movimiento: tbl[i]?.movimiento ?? "",
      pesoActual: tbl[i]?.pesoActual ?? "",
      pesoPropuesto: tbl[i]?.pesoPropuesto ?? "",
      montoActual: tbl[i]?.montoActual ?? "",
      montoPropuesto: tbl[i]?.montoPropuesto ?? "",
    }));
  }, []);
}

function buildPieSlices(
  rows: MergedAllocRow[],
  normalized: number[]
): { name: string; fullName: string; value: number; fillKey: string }[] {
  return rows.map((r, i) => ({
    name: r.labelShort,
    fullName: r.activo,
    value: Math.round(normalized[i] * 100) / 100,
    fillKey: `slice_${i}`,
  }));
}

function DualDonuts({
  rows,
  animate,
}: {
  rows: MergedAllocRow[];
  animate: boolean;
}) {
  const actualNorm = normalizeWeights(rows.map((r) => r.actualPct));
  const proposedNorm = normalizeWeights(rows.map((r) => r.proposedPct));

  const actualSlices = buildPieSlices(rows, actualNorm).filter((s) => s.value > 0.001);
  const proposedSlices = buildPieSlices(rows, proposedNorm).filter((s) => s.value > 0.001);

  const actualConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    actualSlices.forEach((s, i) => {
      const idx = rows.findIndex((r) => r.labelShort === s.name);
      cfg[s.fillKey] = {
        label: s.fullName,
        color: PALETTE[(idx >= 0 ? idx : i) % PALETTE.length],
      };
    });
    return cfg;
  }, [actualSlices, rows]);

  const proposedConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    proposedSlices.forEach((s, i) => {
      const idx = rows.findIndex((r) => r.labelShort === s.name);
      cfg[s.fillKey] = {
        label: s.fullName,
        color: PALETTE[(idx >= 0 ? idx : i) % PALETTE.length],
      };
    });
    return cfg;
  }, [proposedSlices, rows]);

  const renderPie = (
    slices: { name: string; fullName: string; value: number; fillKey: string }[],
    config: Record<string, { label: string; color: string }>
  ) => (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[220px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">{item.payload.fullName}</span>
                  <span className="font-mono text-xs tabular-nums">
                    {Number(value).toFixed(2)}% <span className="text-muted-foreground">(norm.)</span>
                  </span>
                </div>
              )}
              hideIndicator
            />
          }
        />
        <Pie
          data={slices}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={44}
          outerRadius={76}
          paddingAngle={2}
          strokeWidth={2}
          stroke="#fff"
          label={false}
          isAnimationActive={animate}
          animationDuration={750}
        >
          {slices.map((s, index) => {
            const idx = rows.findIndex((r) => r.labelShort === s.name);
            return (
              <Cell key={s.fillKey} fill={PALETTE[(idx >= 0 ? idx : index) % PALETTE.length]} />
            );
          })}
        </Pie>
      </PieChart>
    </ChartContainer>
  );

  return (
    <div className="space-y-3">
      <p className="text-center text-[11px] leading-snug text-muted-foreground">
        Porcentajes normalizados al 100% dentro de cada dona para comparar forma de la cartera (la tabla conserva los pesos
        del informe).
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <div className="w-full max-w-[240px] flex-1">
          <p className="mb-2 text-center text-xs font-semibold text-gray-500">Actual</p>
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            {renderPie(actualSlices, actualConfig)}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#6abf1a]">
          <ArrowRight className="hidden h-8 w-8 sm:block" aria-hidden />
          <ArrowRight className="h-6 w-6 rotate-90 sm:hidden" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Propuesta</span>
        </div>
        <div className="w-full max-w-[240px] flex-1">
          <p className="mb-2 text-center text-xs font-semibold text-[#4a7c59]">Propuesto</p>
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[#BBE795]/50">
            {renderPie(proposedSlices, proposedConfig)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocationBarChart({ rows }: { rows: MergedAllocRow[] }) {
  const data = rows.map((r) => ({
    name: r.labelShort,
    Actual: r.actualPct,
    Propuesto: r.proposedPct,
  }));

  const chartConfig = {
    Actual: { label: "Actual %", color: "#94a3b8" },
    Propuesto: { label: "Propuesto %", color: "#6abf1a" },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[min(420px,56vh)] w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 64 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          angle={-32}
          textAnchor="end"
          height={72}
          interval={0}
        />
        <YAxis tickFormatter={(v) => `${v}%`} width={40} tick={{ fontSize: 10 }} domain={[0, "auto"]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="Actual" fill="var(--color-Actual)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Propuesto" fill="var(--color-Propuesto)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  );
}

function ImpactBarChart() {
  const data = HNW_REBALANCE_Q2_IMPACT_NUMERIC.map((r) => ({
    name: r.chartLabel,
    Actual: r.actual,
    Propuesto: r.proposed,
    unit: r.unit,
  }));

  const chartConfig = {
    Actual: { label: "Actual", color: "#94a3b8" },
    Propuesto: { label: "Propuesto", color: "#6abf1a" },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[min(380px,52vh)] w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 52 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-28} textAnchor="end" height={68} />
        <YAxis tick={{ fontSize: 10 }} width={36} domain={["auto", "auto"]} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const u = (item.payload as { unit?: string }).unit ?? "";
                const suffix = u === "%" ? "%" : u === "a" ? " a" : u ? ` ${u}` : "";
                return (
                  <span className="font-mono tabular-nums">
                    {typeof value === "number" ? value.toLocaleString("es-CO", { maximumFractionDigits: 2 }) : value}
                    {suffix}
                  </span>
                );
              }}
            />
          }
        />
        <Bar dataKey="Actual" fill="var(--color-Actual)" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Propuesto" fill="var(--color-Propuesto)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ChartContainer>
  );
}

function AllocationDeltaCards({
  rows,
  animateKey,
}: {
  rows: MergedAllocRow[];
  animateKey: number;
}) {
  const sorted = React.useMemo(
    () =>
      [...rows].sort(
        (a, b) => Math.abs(b.proposedPct - b.actualPct) - Math.abs(a.proposedPct - a.actualPct)
      ),
    [rows]
  );

  const [visible, setVisible] = React.useState(rows.length);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    setVisible(rows.length);
  }, [rows.length]);

  const runAnimation = React.useCallback(() => {
    setVisible(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setVisible(n);
      if (n >= sorted.length) window.clearInterval(id);
    }, 120);
    return () => window.clearInterval(id);
  }, [sorted.length]);

  React.useEffect(() => {
    if (animateKey <= 0) return undefined;
    return runAnimation();
  }, [animateKey, runAnimation]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Cambios por magnitud — pulsa una fila para ver el movimiento del informe
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full text-[11px]"
          onClick={() => runAnimation()}
        >
          <Play className="size-3.5" aria-hidden />
          Animar orden
        </Button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {sorted.map((r, idx) => {
          const diff = r.proposedPct - r.actualPct;
          const up = diff > 0.05;
          const down = diff < -0.05;
          const show = idx < visible;
          const isOpen = expanded === r.key;

          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : r.key)}
                className={cn(
                  "flex w-full flex-col rounded-xl p-3 text-left ring-1 transition-all duration-300",
                  show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  up ? "bg-[#F0FEE6] ring-[#BBE795]/50" : down ? "bg-red-50 ring-red-200/50" : "bg-gray-50 ring-gray-200/60"
                )}
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      up ? "bg-[#BBE795]/50" : down ? "bg-red-100" : "bg-gray-100"
                    )}
                  >
                    {up ? (
                      <TrendingUp className="size-4 text-[#4a7c59]" aria-hidden />
                    ) : down ? (
                      <TrendingDown className="size-4 text-red-500" aria-hidden />
                    ) : (
                      <Minus className="size-4 text-gray-400" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#1a1a1a]">{r.activo}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                      <span className="tabular-nums">{r.actualPct}%</span>
                      <ArrowRight className="size-3 shrink-0 text-gray-400" aria-hidden />
                      <span
                        className={cn(
                          "tabular-nums font-semibold",
                          up ? "text-[#4a7c59]" : down ? "text-red-600" : "text-gray-600"
                        )}
                      >
                        {r.proposedPct}%
                      </span>
                      <span className={cn("ml-auto tabular-nums font-bold", up && "text-[#4a7c59]", down && "text-red-600")}>
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)} pp
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="size-4 shrink-0 text-gray-400" aria-hidden />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-gray-400" aria-hidden />
                  )}
                </div>
                {isOpen ? (
                  <p className="mt-2 border-t border-black/[0.06] pt-2 text-[11px] leading-relaxed text-gray-700">
                    <span className="font-medium text-[#4a7c59]">Movimiento:</span> {r.movimiento}
                    <span className="mt-1 block text-[10px] text-gray-500">
                      Montos referencia: {r.montoActual} → {r.montoPropuesto}
                    </span>
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HnwRebalanceInteractivePanels() {
  const rows = useMergedAllocationRows();
  const [deltaAnimKey, setDeltaAnimKey] = React.useState(0);

  return (
    <>
      <section className="overflow-x-visible rounded-xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
            5.2 Comparación: portafolio actual vs. portafolio propuesto
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Explora la composición con donas, barras o tarjetas de cambio; la tabla completa sigue disponible.
          </p>
        </div>
        <div className="bg-white px-2 py-4 sm:px-4">
          <Tabs
            defaultValue="donas"
            className="w-full"
            onValueChange={(v) => {
              if (v === "deltas") setDeltaAnimKey((k) => k + 1);
            }}
          >
            <TabsList className="mb-4 flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
              <TabsTrigger value="donas" className="text-xs">
                Donas · forma
              </TabsTrigger>
              <TabsTrigger value="barras" className="text-xs">
                Barras · pesos
              </TabsTrigger>
              <TabsTrigger value="deltas" className="text-xs">
                Cambios · ranking
              </TabsTrigger>
              <TabsTrigger value="tabla" className="text-xs">
                Tabla detalle
              </TabsTrigger>
            </TabsList>
            <TabsContent value="donas" className="mt-0 outline-none">
              <DualDonuts rows={rows} animate />
            </TabsContent>
            <TabsContent value="barras" className="mt-0 outline-none">
              <AllocationBarChart rows={rows} />
            </TabsContent>
            <TabsContent value="deltas" className="mt-0 outline-none">
              <AllocationDeltaCards rows={rows} animateKey={deltaAnimKey} />
            </TabsContent>
            <TabsContent value="tabla" className="mt-0 outline-none">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Peso actual</TableHead>
                    <TableHead className="text-right">Monto actual</TableHead>
                    <TableHead className="text-right">Peso propuesto</TableHead>
                    <TableHead className="text-right">Monto propuesto</TableHead>
                    <TableHead className="min-w-[12rem]">Movimiento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HNW_REBALANCE_Q2_COMPARISON_TABLE.map((row) => (
                    <TableRow key={row.activo}>
                      <TableCell className="font-medium">{row.activo}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.pesoActual}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.montoActual}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-[#4a7c59]">
                        {row.pesoPropuesto}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-[#4a7c59]">
                        {row.montoPropuesto}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{row.movimiento}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-[#fafcf8] font-semibold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COMPARISON_TOTAL.pesoActual}</TableCell>
                    <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COMPARISON_TOTAL.montoActual}</TableCell>
                    <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COMPARISON_TOTAL.pesoPropuesto}</TableCell>
                    <TableCell className="text-right tabular-nums">{HNW_REBALANCE_Q2_COMPARISON_TOTAL.montoPropuesto}</TableCell>
                    <TableCell className="text-sm">{HNW_REBALANCE_Q2_COMPARISON_TOTAL.nota}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="overflow-x-visible rounded-xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100 bg-[#fafcf8] px-4 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
            5.3 Impacto esperado en riesgo y rentabilidad
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Comparativa visual de métricas numéricas (retorno como punto medio del rango del informe).
          </p>
        </div>
        <div className="bg-white px-2 py-4 sm:px-4">
          <Tabs defaultValue="grafico" className="w-full">
            <TabsList className="mb-4 flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
              <TabsTrigger value="grafico" className="text-xs">
                Barras · métricas
              </TabsTrigger>
              <TabsTrigger value="tabla" className="text-xs">
                Tabla · texto del informe
              </TabsTrigger>
            </TabsList>
            <TabsContent value="grafico" className="mt-0 outline-none space-y-3">
              <ImpactBarChart />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                La fila «Exposición USD» del informe no se grafica aquí porque mezcla bruto vs neto con cobertura; consultala
                en la tabla y en la nota al pie.
              </p>
            </TabsContent>
            <TabsContent value="tabla" className="mt-0 outline-none">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Métrica</TableHead>
                    <TableHead className="text-right">Portafolio actual</TableHead>
                    <TableHead className="text-right">Portafolio propuesto</TableHead>
                    <TableHead className="text-right">Cambio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HNW_REBALANCE_Q2_IMPACT_METRICS.map((row) => (
                    <TableRow key={row.metrica}>
                      <TableCell className="font-medium">{row.metrica}</TableCell>
                      <TableCell className="text-right tabular-nums text-gray-600">{row.actual}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-[#4a7c59]">
                        {row.propuesto}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-gray-800">{row.cambio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="border-t border-gray-100 bg-[#F0FEE6]/25 px-4 py-3 text-xs leading-relaxed text-gray-700">
                {HNW_REBALANCE_Q2_USD_FOOTNOTE}
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
