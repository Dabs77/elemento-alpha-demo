"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, House, Loader2, PenLine, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SimulatedDigitalSignature,
  type SimulatedSignature,
} from "@/components/sarlaft/SimulatedDigitalSignature";
import type { SarlaftPackage } from "@/lib/sarlaft/schema";
import { computeMissingFields, hasMissingFields } from "@/lib/sarlaft/missingFields";

interface Props {
  sarlaftPkg: SarlaftPackage;
  empresaLabel: string;
  onGeneratePdf: () => Promise<void>;
  generating: boolean;
  onBack: () => void;
  onRestart: () => void;
}

export function FinalSignatureStep({
  sarlaftPkg,
  empresaLabel,
  onGeneratePdf,
  generating,
  onBack,
  onRestart,
}: Props) {
  const [simulatedSignature, setSimulatedSignature] = useState<SimulatedSignature | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSend =
    !hasMissingFields(sarlaftPkg) && !sending && !generating && simulatedSignature !== null;

  const handleFinalize = useCallback(async () => {
    if (!canSend) return;
    setSent(false);
    setSending(true);
    try {
      await onGeneratePdf();
      setSent(true);
    } finally {
      setSending(false);
    }
  }, [canSend, onGeneratePdf]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="h-9 px-0 text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
        </Button>
        <Link href="/" className="inline-flex">
          <Button variant="outline" className="h-9 px-3 gap-1.5 text-gray-600">
            <House className="h-4 w-4" /> Home
          </Button>
        </Link>
      </div>

      <header>
        <p className="text-xs font-semibold text-[#6abf1a] uppercase tracking-wider mb-1">Paso 9 · Firma final</p>
        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Firma y envío</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xl">
          Último paso de la vinculación: confirma la{" "}
          <span className="font-medium text-[#1a1a1a]">firma digital simulada</span> como representante de{" "}
          <span className="font-medium text-[#1a1a1a]">{empresaLabel}</span> y genera el paquete para la fiduciaria.
        </p>
      </header>

      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm flex items-start gap-3">
        <PenLine className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">Consentimiento y trazabilidad</p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Esta acción sella el proceso de onboarding de la demo (sin validez jurídica externa). Descarga el ZIP como
            respaldo del paquete SARLAFT / FATCA / vinculación.
          </p>
        </div>
      </div>

      <SimulatedDigitalSignature
        value={simulatedSignature}
        onChange={setSimulatedSignature}
        disabled={Boolean(generating || sending)}
      />

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button variant="outline" disabled={generating || sending} onClick={onGeneratePdf}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Descargar ZIP
        </Button>
        <Button
          type="button"
          className="bg-[#4a7c59] text-white"
          disabled={!canSend}
          onClick={handleFinalize}
          title={!simulatedSignature ? "Primero confirma la firma digital simulada" : undefined}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Finalizar envío (demo)
        </Button>
      </div>

      {sent ? (
        <p className="text-sm text-center text-[#4a7c59] font-medium">
          Envío simulado completado. Puedes volver al inicio cuando quieras.
        </p>
      ) : null}

      {!hasMissingFields(sarlaftPkg) ? null : (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Faltan {computeMissingFields(sarlaftPkg).length} campo(s) obligatorio(s) en el paquete. Vuelve al paso
          anterior con &quot;Volver&quot; o reinicia el proceso.
        </p>
      )}

      <Button
        type="button"
        variant="ghost"
        onClick={onRestart}
        className="w-full h-9 rounded-lg text-sm text-gray-500 hover:text-gray-700 gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reiniciar proceso
      </Button>
    </div>
  );
}
