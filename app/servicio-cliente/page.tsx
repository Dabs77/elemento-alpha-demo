"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Calendar,
  ClipboardList,
  FileText,
  LineChart,
  MessageCircleQuestion,
  PieChart,
  Sparkles,
  TrendingUp,
  Video,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BenchmarkReportActions } from "@/components/portfolio/BenchmarkReportActions";
import { ServicioClienteConsultasVoice } from "@/components/servicio-cliente/ServicioClienteConsultasVoice";

const DEMO_CLIENT = {
  name: "Inversiones Orinoquia S.A.S.",
  segment: "HNW · Corporativo PJ",
  aumApprox: "$4.872M COP eq.",
  period: "Ene · Mar 2026",
};

const PHASE1_PRODUCTS = [
  { product: "FIC Horizontes Balanceado", saldo: "$1.982M", ytdPct: "+4,1%", vsBench: "+1,9 pp" },
  { product: "FIC Renta FI Corto Plazo", saldo: "$1.641M", ytdPct: "+2,8%", vsBench: "+0,4 pp" },
  { product: "CDT Ladder Corporativo", saldo: "$1.249M", ytdPct: "+11,7% nominal", vsBench: "n/a" },
];

const PHASE1_ALERTS = [
  { level: "info", title: "Vencimiento tramo CDT", detail: "15 may 2026 · instrucciones sin definir para reinversión." },
  {
    level: "watch",
    title: "Sesgo soberano",
    detail: "Exposición local 68% vs objetivo modelo 62% · vigilancia revisión mensual.",
  },
];

const PHASE4_ROWS = [
  { label: "Asignación local / soberano", actual: "68%", propuesta: "60%", nota: "Reducir crowding país" },
  { label: "Duración modificada media", actual: "3,9 a", propuesta: "4,7 a", nota: "Mejor cobertura de rolldown 2027" },
  { label: "Volatilidad anualizada est.", actual: "7,2%", propuesta: "8,9%", nota: "Dentín de objetivo cliente" },
  { label: "Costo transacción estimado*", actual: "—", propuesta: "0,12% AUM", nota: "Broker + spreads" },
];

export default function ServicioClientePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#1a1a1a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Inicio
            </Link>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#1a1a1a]">Elemento Alpha</h1>
              <p className="text-xs text-gray-500">Reporting &amp; Customer Support · MVP agentic Wealth OS</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-none bg-[#F0FEE6] font-semibold text-[#4a7c59] ring-1 ring-[#BBE795]/40">
              Asesoría personalizada
            </Badge>
            <Badge variant="outline" className="font-medium text-gray-600">
              Caso sintético
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div className="mb-8 max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6abf1a]">Servicio al cliente · HNW</p>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a] sm:text-3xl">
            Demo del flujo con automatización agentica
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Visualización ejecutiva del recorrido: el{" "}
            <span className="font-medium text-[#1a1a1a]">agente de relación</span> prepara materiales antes de la
            reunión, orienta preguntas frecuentes y propone rebalanceos. Todo con números de ejemplo coherentes —
            sin integraciones reales a CRM/Bloomberg en esta versión.
          </p>
        </div>

        <Card className="mb-8 border-[#BBE795]/35 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">Cliente ejemplo</CardTitle>
              <Badge variant="secondary" className="font-normal">
                {DEMO_CLIENT.segment}
              </Badge>
            </div>
            <CardDescription>
              Activos consolidados estimados{" "}
              <span className="font-semibold text-foreground">{DEMO_CLIENT.aumApprox}</span> · período informe{" "}
              <span className="font-medium text-foreground">{DEMO_CLIENT.period}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <span className="font-medium text-[#1a1a1a]">{DEMO_CLIENT.name}</span> — política modelo: perfil moderado con
            techo soberano revisable trimestralmente.
          </CardContent>
        </Card>

        <Tabs defaultValue="fase1" className="w-full">
          <TabsList className="mb-6 flex h-auto w-full flex-col gap-1 sm:flex-row sm:flex-wrap">
            <TabsTrigger value="fase1" className="gap-2 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Fase 1 · Informe</span>
            </TabsTrigger>
            <TabsTrigger value="fase2" className="gap-2 text-xs sm:text-sm">
              <Video className="h-4 w-4 shrink-0" />
              <span>Fase 2 · Reunión</span>
            </TabsTrigger>
            <TabsTrigger value="fase3" className="gap-2 text-xs sm:text-sm">
              <MessageCircleQuestion className="h-4 w-4 shrink-0" />
              <span>Fase 3 · Consultas</span>
            </TabsTrigger>
            <TabsTrigger value="fase4" className="gap-2 text-xs sm:text-sm">
              <PieChart className="h-4 w-4 shrink-0" />
              <span>Fase 4 · Ajuste</span>
            </TabsTrigger>
            <TabsTrigger value="fase5" className="gap-2 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>Fase 5 · Cierre</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fase1" className="space-y-4 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-[#fafcf8]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
                      Automatización agentica
                    </p>
                    <CardTitle className="mt-1 text-lg">Borrador de informe de cuenta</CardTitle>
                    <CardDescription className="mt-1">
                      Consolidación sintética: saldos por producto, rendimiento trimestral, comparación benchmark y
                      alertas — listo antes de CRM sync. El{" "}
                      <strong className="text-[#1a1a1a] font-semibold">
                        {" "}entregable en presentación PDF/HTML
                      </strong>{" "}
                      (portada, rebalanceo BMK, frontera, scoring y tabla de asignaciones) se genera desde los mismos JSON
                      del Front Office · Portafolio.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-[#BBE795]/45">
                    <Bot className="h-5 w-5 text-[#4a7c59]" aria-hidden />
                    <span className="font-medium text-[#1a1a1a]">ELEMENTO ALPHA · Agente RM</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border border-[#BBE795]/45 bg-[#F0FEE6]/35 p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
                    Entregable fase 1 · Presentación ejecutiva
                  </p>
                  <p className="mt-1.5 text-sm text-gray-700 leading-snug max-w-xl">
                    Abre la versión multipágina tipo deck o descarga PDF (si hay Cloudflare configurado). Datos:
                    asignaciones y métricas modelo desde el proyecto (<code className="text-[11px]">assetAllocation.json</code>{" "}
                    / <code className="text-[11px]">portfolioMetrics.json</code>), alineados al proceso 2 · Portafolios.
                  </p>
                  <BenchmarkReportActions className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2" />
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <LineChart className="h-3.5 w-3.5" />
                    Desempeño vs benchmark modelo
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">YTD apróx.</TableHead>
                        <TableHead className="text-right">vs modelo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PHASE1_PRODUCTS.map((r) => (
                        <TableRow key={r.product}>
                          <TableCell className="font-medium text-[#1a1a1a]">{r.product}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.saldo}</TableCell>
                          <TableCell className="text-right tabular-nums text-[#4a7c59]">{r.ytdPct}</TableCell>
                          <TableCell className="text-right text-sm text-gray-600">{r.vsBench}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-[#fafcf8]/80 hover:bg-[#fafcf8]">
                        <TableCell className="font-semibold">Consolidado</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">$4.872M</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-[#4a7c59]">+3,6%</TableCell>
                        <TableCell className="text-right text-sm font-medium text-gray-700">
                          MSCI Colombia Select · Δ +1,1 pp*
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="mt-2 text-[11px] text-gray-400">* Serie benchmark simulada con fines únicamente demo.</p>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Alertas activas</p>
                  <ul className="space-y-3">
                    {PHASE1_ALERTS.map((a, i) => (
                      <li
                        key={i}
                        className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${
                          a.level === "watch"
                            ? "border-amber-200/90 bg-amber-50/60 text-amber-950"
                            : "border-[#BBE795]/35 bg-[#F0FEE6]/35 text-[#1a1a1a]"
                        }`}
                      >
                        <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${a.level === "watch" ? "text-amber-600" : "text-[#4a7c59]"}`} />
                        <span>
                          <span className="font-semibold">{a.title}: </span>
                          {a.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-4 text-xs text-gray-600">
                  <strong className="text-[#1a1a1a]">Inputs modelados como provee ELEMENTO ALPHA:</strong> filosofía de
                  inversión (moderado/soberano revisable), posiciones sintéticas, clip macro trimestral (inflación, tasas)
                  empacado como contexto oculto al agente. En producción: CRM · reporting · data feed económico.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fase2" className="space-y-4 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-[#fafcf8]">
                <div className="flex flex-wrap items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#4a7c59]" aria-hidden />
                  <CardTitle className="text-lg">Sesión trimestral simulada</CardTitle>
                </div>
                <CardDescription>Formato videoconferencia · duración ejemplo 52 minutos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-gray-700">
                  <li>
                    <span className="font-medium text-[#1a1a1a]">Apertura y contexto de mercado</span> · repaso rápido
                    inflación/regional (bullet pack generado en Fase 1).
                  </li>
                  <li>
                    <span className="font-medium text-[#1a1a1a]">Revisión de desempeño</span> · validación cliente de
                    cifras YTD consolidadas (+3,6% vs modelo +2,5%).
                  </li>
                  <li>
                    <span className="font-medium text-[#1a1a1a]">Objetivos y liquidez</span> · confirmación de capex{" "}
                    <span className="tabular-nums">Q3 2026</span> mencionado en briefing del agente.
                  </li>
                  <li>
                    <span className="font-medium text-[#1a1a1a]">Riesgos y vigilancia soberana</span> · acuerdo de
                    monitoreo mensual del sesgo 68%.
                  </li>
                </ol>
                <div className="rounded-lg bg-[#1a231c]/90 px-5 py-4 text-sm leading-relaxed text-white/92">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#BBE795]/90">
                    Agenda compartida (extracto CRM simulado)
                  </p>
                  <p className="mt-2">
                    &ldquo;Confirmar línea telefónica de escalamiento · cargar síntesis de stress FX en expediente cliente
                    ORN-8842 antes del miércoles.&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fase3" className="space-y-4 animate-in fade-in duration-300">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <MessageCircleQuestion className="h-5 w-5 text-[#4a7c59]" aria-hidden />
                  <CardTitle className="text-lg">Consultas ad hoc · agente de voz</CardTitle>
                </div>
                <CardDescription>
                  Conversación por voz después del informe de cuenta, con contexto sintético de la empresa y el portafolio
                  demo — sin ejecutar órdenes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServicioClienteConsultasVoice />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fase4" className="space-y-4 animate-in fade-in duration-300">
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-[#fafcf8]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Propuesta formal de rebalanceo</CardTitle>
                    <CardDescription>
                      Derivada de hallazgos de la reunión y consultas sintéticas. Incluye justificación económica y costos.
                    </CardDescription>
                  </div>
                  <Badge className="shrink-0 border-none bg-[#4a7c59] font-semibold">Borrador v0.9</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Ítem</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Propuesto</TableHead>
                      <TableHead className="min-w-[8rem]">Nota estratégica</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PHASE4_ROWS.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-right tabular-nums text-gray-600">{row.actual}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-[#4a7c59]">{row.propuesta}</TableCell>
                        <TableCell className="text-sm text-gray-600">{row.nota}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm ring-1 ring-gray-100">
                  <TrendingUp className="h-4 w-4 text-[#6abf1a]" aria-hidden />
                  <span>
                    <span className="font-semibold text-[#1a1a1a]">Rentabilidad esperada a 12 meses (base): </span>
                    sube ~40 pb vs cartera mantenida, con incremento puntual drawdown táctico.
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">* Comisiones y spreads illustrative — no ejecutables desde este MVP.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fase5" className="space-y-4 animate-in fade-in duration-300">
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-5 w-5 text-[#4a7c59]" aria-hidden />
                  <CardTitle className="text-lg">Documentación y follow-up</CardTitle>
                </div>
                <CardDescription>Registro simulado de acuerdos, responsables y recordatorios operativos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#BBE795]/50 text-[11px] font-bold text-[#1a1a1a]">
                      1
                    </span>
                    <span>
                      Minuta cargada en CRM · caso <strong className="text-[#1a1a1a]">ORN-8842</strong> con tag{" "}
                      <Badge variant="secondary" className="mx-1 font-normal">
                        rebalance_Q2
                      </Badge>
                      .
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#BBE795]/50 text-[11px] font-bold text-[#1a1a1a]">
                      2
                    </span>
                    <span>
                      Confirmación escrita automatizada enviada a representante legal corporativo · plantilla ELEMENTO ALPHA
                      (simulación, sin SMTP).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#BBE795]/50 text-[11px] font-bold text-[#1a1a1a]">
                      3
                    </span>
                    <span>
                      Tareas: &ldquo;Alistar instrucciones de disposición parcial CDT 15 mayo&rdquo; · Owner RM · Due{" "}
                      <strong className="tabular-nums">08 abr 2026</strong>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#BBE795]/50 text-[11px] font-bold text-[#1a1a1a]">
                      4
                    </span>
                    <span>Próximo checkpoint trimestral pre-agendado (recordatorio día −7 + brief agente).</span>
                  </li>
                </ul>
                <div className="rounded-lg border border-dashed border-[#BBE795]/55 bg-[#F0FEE6]/40 p-4 text-xs text-gray-700">
                  En producción, el mismo agente podría abrir subtareas en ticketing, poblar Salesforce y enlazar archivo de
                  acuerdos firmados. Aquí sólo evidenciamos el flujo de valor narrativo para stakeholders.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Datos sintéticos · sin custodia, ejecución ni compliance productivo.</span>
          <div className="flex gap-4">
            <Link href="/portfolio" className="font-medium text-[#6abf1a] hover:underline">
              Portafolios (Front Office)
            </Link>
            <Link href="/onboarding" className="font-medium text-[#6abf1a] hover:underline">
              Onboarding
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
