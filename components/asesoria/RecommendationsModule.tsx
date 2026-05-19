"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  CircleDashed,
  Lightbulb,
  ListChecks,
  Sparkles,
  TrendingUp,
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

function RuleIcon({ id }: { id: ClientRecommendationRule["id"] }) {
  if (id === "traslado_total_cxc_6_12") {
    return <ArrowRightLeft className="h-5 w-5 text-[#4a7c59]" />;
  }
  if (id === "traslado_total_cxc_aumento_20") {
    return <TrendingUp className="h-5 w-5 text-[#4a7c59]" />;
  }
  return <Sparkles className="h-5 w-5 text-[#4a7c59]" />;
}

function RuleCard({
  rule,
  variant,
}: {
  rule: ClientRecommendationRule;
  variant: "active" | "list";
}) {
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
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isActive ? "bg-[#4a7c59]/10" : "bg-gray-100"
          }`}
        >
          <RuleIcon id={rule.id} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{rule.titulo}</h4>
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4a7c59] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <CheckCircle2 className="h-3 w-3" />
                Aplica
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                <CircleDashed className="h-3 w-3" />
                No aplica
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
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Regla
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{rule.condicion}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function RecommendationsModule({ cliente }: RecommendationsModuleProps) {
  const [allOpen, setAllOpen] = useState(false);
  const client = useMemo(() => normalizeSimulatedClient(cliente), [cliente]);
  const { active, all } = useMemo(
    () => evaluateClientRecommendations(client),
    [client],
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#4a7c59]/8 via-[#F0FEE6]/40 to-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4a7c59] shadow-sm">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recomendaciones</h3>
                <p className="text-xs text-gray-500">
                  Sugerencia comercial según permanencia y comportamiento de retiros
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllOpen(true)}
              className="shrink-0 border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#F0FEE6]/60"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Ver todas las sugerencias
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Contexto del cliente */}
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
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
                Revisa todas las sugerencias para ver los criterios de permanencia y retiros que
                activan cada opción comercial.
              </p>
            </div>
          )}
        </div>
      </div>

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
