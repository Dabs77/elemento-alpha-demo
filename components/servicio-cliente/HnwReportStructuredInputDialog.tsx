"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HNW_REPORT_KNOWLEDGE_BASE_INPUT } from "@/lib/servicio-cliente/hnwReportKbInput";

function PolicyKbPanel() {
  const kb = HNW_REPORT_KNOWLEDGE_BASE_INPUT;
  const s = kb.seccion;

  return (
    <div className="space-y-8 pb-1">
      <div className="relative overflow-hidden rounded-2xl border border-[#BBE795]/45 bg-gradient-to-br from-[#F0FEE6]/90 via-white to-[#fafcf8] px-5 py-6 shadow-[0_1px_0_rgba(74,124,89,0.06)] sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#BBE795]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[#6abf1a]/10 blur-3xl" />
        <div className="relative space-y-2">
          <Badge className="border-none bg-[#4a7c59]/90 font-semibold text-white hover:bg-[#4a7c59]">
            Base de conocimiento · IPS
          </Badge>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-[#1a1a1a] sm:text-xl">
            {kb.tituloDocumento}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-600">{s.tituloPrincipal}</p>
        </div>
      </div>

      <article className="space-y-6">
        <section className="space-y-3">
          <header className="border-l-[3px] border-[#6abf1a] pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              {s.objetivoGeneral.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1a1a1a]">{s.objetivoGeneral.titulo}</h3>
          </header>
          <p className="pl-[3px] text-sm leading-relaxed text-gray-700 sm:pl-[calc(1rem+3px)]">
            {s.objetivoGeneral.texto}
          </p>
        </section>

        <section className="space-y-3">
          <header className="border-l-[3px] border-[#6abf1a] pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              {s.perfilInversor.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1a1a1a]">{s.perfilInversor.titulo}</h3>
          </header>
          <p className="pl-[3px] text-sm leading-relaxed text-gray-700 sm:pl-[calc(1rem+3px)]">
            {s.perfilInversor.texto}
          </p>
        </section>

        <section className="space-y-4">
          <header className="border-l-[3px] border-[#6abf1a] pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              {s.filosofia.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1a1a1a]">{s.filosofia.titulo}</h3>
          </header>
          <p className="pl-[3px] text-sm font-medium text-[#1a1a1a]/90 sm:pl-[calc(1rem+3px)]">
            {s.filosofia.introduccion}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {s.filosofia.pilares.map((p, i) => (
              <div
                key={p.nombre}
                className="rounded-xl border border-[#BBE795]/35 bg-[#fafcf8]/90 px-4 py-3.5 shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#BBE795]/40 text-xs font-bold text-[#2d5a3d]">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-semibold leading-snug text-[#1a1a1a]">{p.nombre}</h4>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">{p.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <header className="border-l-[3px] border-[#6abf1a] pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
              {s.restricciones.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1a1a1a]">{s.restricciones.titulo}</h3>
          </header>
          <div className="overflow-hidden rounded-xl border border-[#BBE795]/30 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#BBE795]/25 bg-[#f6faf7]/90 hover:bg-[#f6faf7]/90">
                  <TableHead className="w-[32%] font-semibold text-[#2d5a3d]">Restricción</TableHead>
                  <TableHead className="font-semibold text-[#2d5a3d]">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.restricciones.filas.map((row) => (
                  <TableRow key={row.restriccion} className="hover:bg-[#fafcf8]/80">
                    <TableCell className="align-top text-sm font-medium text-[#1a1a1a]">
                      {row.restriccion}
                    </TableCell>
                    <TableCell className="align-top text-sm leading-relaxed text-gray-700">
                      {row.detalle}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </article>
    </div>
  );
}

export function HnwReportStructuredInputDialog({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <BookOpen className="mr-2 h-4 w-4 shrink-0" aria-hidden />
        Ver input del informe
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(88vh,760px)] max-w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        >
          <div className="border-b border-border/80 bg-[#fafcf8]/60 px-5 py-4 sm:px-6">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-left text-lg">Input del informe ejecutivo</DialogTitle>
              <DialogDescription className="text-left">
                Política, filosofía de inversiones y restricciones IPS que sirven de base para la demo.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-3 sm:px-5">
            <div className="rounded-xl border border-[#BBE795]/20 bg-[#FAFAFA]/50 px-3 py-4 sm:px-5">
              <PolicyKbPanel />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
