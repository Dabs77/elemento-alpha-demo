"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ACTIVE_ALERTS,
  ALLOCATION_OBJECTIVE_ROWS,
  BENCHMARK_REFERENCE_ROWS,
  CLIENT_SHEET_ROWS,
  COMPARISON_VS_BENCHMARK,
  DISTRIBUTION_BY_ASSET_TYPE,
  DISTRIBUTION_BY_CURRENCY,
  MACRO_CONTEXT_Q1,
} from "@/lib/servicio-cliente/hnwAlejandroReport";
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
import { PORTFOLIO_METRICS } from "@/lib/portfolio/portfolioData";
import { HnwReportStructuredInputDialog } from "@/components/servicio-cliente/HnwReportStructuredInputDialog";

export function HnwExecutiveReport() {
  const bmk = PORTFOLIO_METRICS.benchmark;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <HnwReportStructuredInputDialog />
        <span className="text-[11px] text-gray-500">
          Política IPS y restricciones mostradas como base del informe (demo).
        </span>
      </div>
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          1 · Ficha y estado del cliente
        </p>
        <Table>
          <TableBody>
            {CLIENT_SHEET_ROWS.map((row) => (
              <TableRow key={row.label} className="hover:bg-[#fafcf8]/80">
                <TableCell className="w-[40%] font-medium text-gray-600">{row.label}</TableCell>
                <TableCell className="font-medium text-[#1a1a1a]">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          1.5 · Benchmark de referencia
        </p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Componente del benchmark</TableHead>
              <TableHead className="text-right">Ponderación</TableHead>
              <TableHead className="text-right">Frecuencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {BENCHMARK_REFERENCE_ROWS.map((r) => (
              <TableRow key={r.component}>
                <TableCell className="font-medium text-[#1a1a1a]">{r.component}</TableCell>
                <TableCell className="text-right tabular-nums">{r.weightPct}</TableCell>
                <TableCell className="text-right">{r.frequency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-2 text-[11px] text-gray-400">
          El desempeño del portafolio se medirá contra el benchmark compuesto anterior (demo sintética).
        </p>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          2.1 · Asset allocation objetivo y estado de cuenta — Portafolio inicial
        </p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Clase / bucket</TableHead>
              <TableHead className="text-right">Objetivo</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="min-w-[7rem]">Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALLOCATION_OBJECTIVE_ROWS.map((r) => (
              <TableRow key={r.clase}>
                <TableCell className="font-medium text-[#1a1a1a]">{r.clase}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">{r.objetivoPct}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{r.actualPct}</TableCell>
                <TableCell className="text-sm text-gray-600">{r.nota ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          2.2 · Distribución por moneda y tipo de activo
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-[#BBE795]/35 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Por moneda</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-gray-800">{DISTRIBUTION_BY_CURRENCY}</CardContent>
          </Card>
          <Card className="border-[#BBE795]/35 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Por tipo de activo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-gray-800">{DISTRIBUTION_BY_ASSET_TYPE}</CardContent>
          </Card>
        </div>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          2.3 · Comparación vs. benchmark (Q1 2026)
        </p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Métrica</TableHead>
              <TableHead className="text-right">Portafolio</TableHead>
              <TableHead className="text-right">Benchmark</TableHead>
              <TableHead className="text-right">Alpha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARISON_VS_BENCHMARK.map((r) => (
              <TableRow key={r.metric}>
                <TableCell className="font-medium">{r.metric}</TableCell>
                <TableCell className="text-right tabular-nums text-[#4a7c59]">{r.portfolio}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-700">{r.benchmark}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{r.alpha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          2.4 · Alertas activas
        </p>
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-11 shrink-0 px-2" />
              <TableHead className="w-[46%] whitespace-normal px-3 align-bottom">
                Alerta
              </TableHead>
              <TableHead className="whitespace-normal px-3 align-bottom">Acción sugerida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACTIVE_ALERTS.map((a, i) => (
              <TableRow key={i}>
                <TableCell className="align-top whitespace-normal p-2">
                  {a.status === "ok" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4a7c59]" aria-hidden />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  )}
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words px-3 py-3 text-sm leading-relaxed">
                  {a.alerta}
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words px-3 py-3 text-sm leading-relaxed text-gray-700">
                  {a.accionSugerida}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
          3.1 · Contexto macroeconómico al Q1 2026
        </p>
        <Card className="overflow-hidden border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-[#fafcf8] py-3">
            <CardTitle className="text-sm">Variables de mercado</CardTitle>
            <CardDescription className="text-xs">Datos sintéticos según brief demo · sin fuentes en vivo.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Variable</TableHead>
                  <TableHead className="text-right">Dato actual</TableHead>
                  <TableHead className="text-right">Trim. anterior</TableHead>
                  <TableHead>Tendencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MACRO_CONTEXT_Q1.map((row) => (
                  <TableRow key={row.variable}>
                    <TableCell className="font-medium text-[#1a1a1a]">{row.variable}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.actual}</TableCell>
                    <TableCell className="text-right tabular-nums text-gray-600">{row.anterior}</TableCell>
                    <TableCell className="text-sm">{row.tendencia}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card className="border-dashed border-[#BBE795]/55 bg-[#F0FEE6]/25">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Referencias internas FO (proyecto)</CardTitle>
          <CardDescription className="text-xs">
            Métricas del benchmark ultralíquido del módulo Portafolios —{" "}
            <strong className="text-[#1a1a1a]">no</strong> sustituyen el benchmark compuesto del cliente anterior.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-xs tabular-nums text-gray-700">
          <span>
            <span className="font-semibold text-[#1a1a1a]">Retorno esp. BMK: </span>
            {bmk.expectedReturn.toFixed(2)}%
          </span>
          <span>
            <span className="font-semibold text-[#1a1a1a]">Vol. BMK: </span>
            {bmk.volatility.toFixed(2)}%
          </span>
          <span>
            <span className="font-semibold text-[#1a1a1a]">Max DD BMK: </span>
            {bmk.maxDrawdown.toFixed(2)}%
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
