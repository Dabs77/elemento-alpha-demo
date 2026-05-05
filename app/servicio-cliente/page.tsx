"use client";

import Link from "next/link";
import { ArrowLeft, Bot, MessageCircleQuestion, Sparkles, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReunionSimuladaChat } from "@/components/servicio-cliente/ReunionSimuladaChat";
import { HnwExecutiveReport } from "@/components/servicio-cliente/HnwExecutiveReport";
import { HnwReportActions } from "@/components/servicio-cliente/HnwReportActions";
import { ServicioClienteFase3Bundle } from "@/components/servicio-cliente/ServicioClienteFase3Bundle";
import { HNW_CLIENT_DEMO } from "@/lib/servicio-cliente/hnwAlejandroReport";

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
            Informe ejecutivo, reunión simulada y consultas SKILLS por voz con síntesis — demo sin CRM ni ejecución real.
          </p>
        </div>

        <Card className="mb-8 border-[#BBE795]/35 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">Cliente ejemplo</CardTitle>
              <Badge variant="secondary" className="font-normal">
                Persona Jurídica
              </Badge>
            </div>
            <CardDescription>
              Expediente demo{" "}
              <span className="font-semibold text-foreground">{HNW_CLIENT_DEMO.expedienteId}</span> · informe{" "}
              <span className="font-medium text-foreground">{HNW_CLIENT_DEMO.fechaElaboracion}</span> · próxima revisión{" "}
              <span className="font-medium text-foreground">{HNW_CLIENT_DEMO.proximaRevision}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <span className="font-medium text-[#1a1a1a]">{HNW_CLIENT_DEMO.nombre}</span> — perfil moderado, horizonte corto,
            moneda COP; política demo alineada a base de conocimiento IPS Elemento Alpha.
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
          </TabsList>

          <TabsContent value="fase1" className="space-y-4 animate-in fade-in duration-300">
            <Card className="overflow-hidden border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-[#fafcf8]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4a7c59]">
                      Automatización agentica
                    </p>
                    <CardTitle className="mt-1 text-lg">Informe ejecutivo (borrador)</CardTitle>
                    <CardDescription className="mt-1">
                      Incluye ficha Acropolis Labs SAS (PJ), benchmark compuesto, asignación vs estado, distribución,
                      comparación vs benchmark, alertas y macro. Export HTML/PDF opcional. La nota FO del proyecto no sustituye
                      el benchmark del cliente.
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
                    Export · informe multipágina
                  </p>
                  <p className="mt-1.5 max-w-xl text-sm leading-snug text-gray-700">
                    Misma fuente que las tablas siguientes. Para el informe BMK ultralíquido del Front Office:{" "}
                    <Link href="/portfolio" className="font-medium text-[#6abf1a] hover:underline">
                      Portafolios
                    </Link>
                    .
                  </p>
                  <HnwReportActions className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2" />
                </div>
                <HnwExecutiveReport />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fase2" className="space-y-4 animate-in fade-in duration-300">
            <ReunionSimuladaChat />
          </TabsContent>

          <TabsContent value="fase3" className="space-y-4 animate-in fade-in duration-300">
            <ServicioClienteFase3Bundle />
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
