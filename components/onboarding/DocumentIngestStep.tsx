"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Receipt,
  Users,
  BarChart2,
  Landmark,
  Shield,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntakeData } from "@/app/onboarding/page";
import type { MissingFieldRef, SarlaftPackage } from "@/lib/sarlaft/schema";
import type { OcrReportItem } from "@/lib/sarlaft/ocrTypes";
import { computeMissingFields } from "@/lib/sarlaft/missingFields";
import { buildOnboardingPackageFromExternalIngest } from "@/lib/sarlaft/onboardingSarlaftMerge";

interface ExternalDocRow {
  id: string;
  icon: React.ElementType;
  title: string;
  /** Subtítulo corto */
  detail: string;
}

const EXTERNAL_DOCS: ExternalDocRow[] = [
  {
    id: "rut",
    icon: Receipt,
    title: "RUT",
    detail: "Registro Único Tributario.",
  },
  {
    id: "camara",
    icon: Building2,
    title: "Certificado de Cámara de Comercio",
    detail: "Existencia y representación legal vigente.",
  },
  {
    id: "cedula",
    icon: CreditCard,
    title: "Cédula del representante legal",
    detail: "Documento de identidad del RL.",
  },
  {
    id: "estados",
    icon: BarChart2,
    title: "Estados financieros",
    detail: "Último corte anual certificado.",
  },
  {
    id: "accionaria",
    icon: Users,
    title: "Certificado de composición accionaria",
    detail: "Composición societaria y participaciones.",
  },
  {
    id: "renta",
    icon: Landmark,
    title: "Declaración de renta",
    detail: "Último periodo gravable.",
  },
  {
    id: "sagrilaft",
    icon: Shield,
    title: "Políticas / documento SARLAFT",
    detail: "Referencia LA/FT cuando aplica.",
  },
];

type Phase = "loading" | "done";

interface Props {
  intake: IntakeData;
  onContinue: (payload: {
    package: SarlaftPackage;
    missing: MissingFieldRef[];
    ocrReport: OcrReportItem[] | null;
  }) => void;
  onBack?: () => void;
}

export function DocumentIngestStep({ intake, onContinue, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [pct, setPct] = useState(0);

  const empresa = intake.empresa.trim() || "tu empresa";
  const nitDisplay = intake.nit.trim() || "—";

  useEffect(() => {
    if (phase !== "loading") return;
    const totalMs = 3800;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const next = Math.min(100, Math.round((elapsed / totalMs) * 100));
      setPct(next);
      if (next >= 100) {
        setPhase("done");
        return;
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const handleContinue = () => {
    const pkg = buildOnboardingPackageFromExternalIngest({
      nombre: intake.nombre,
      empresa: intake.empresa,
      nit: intake.nit,
      sector: intake.sector ?? "",
    });
    onContinue({
      package: pkg,
      missing: computeMissingFields(pkg),
      ocrReport: null,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="h-9 px-0 text-gray-500" disabled={phase === "loading"}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
          </Button>
        ) : (
          <span />
        )}
        <Button
          id="ingest-next-top"
          type="button"
          onClick={handleContinue}
          disabled={phase === "loading"}
          className={`h-9 px-5 rounded-lg font-semibold gap-1.5 transition-all duration-200 ${
            phase === "done"
              ? "bg-[#4a7c59] text-white hover:bg-[#3f6b4c] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {phase === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando fuentes…
            </>
          ) : (
            <>Continuar a validación de identidad</>
          )}
        </Button>
      </div>

      <header>
        <p className="text-xs font-semibold text-[#6abf1a] uppercase tracking-wider mb-1">Paso 4 · Ingesta</p>
        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Documentación corporativa</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xl">
          El modelo integra <span className="font-medium text-[#1a1a1a]">fuentes externas</span> para obtener y
          estructurar la documentación de{" "}
          <span className="font-medium text-[#1a1a1a]">{empresa}</span> conforme al NIT registrado. En esta demo
          todos los soportes aparecen completos al finalizar la sincronización simulada.
        </p>
      </header>

      <div className="rounded-lg border border-[#BBE795]/50 bg-[#F0FEE6]/40 px-4 py-3 flex gap-3 items-start">
        <Database className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">Carga de fuentes externas</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            (consulta que se hace con el NIT:{" "}
            <span className="font-mono text-[#1a1a1a] font-medium">{nitDisplay}</span>)
          </p>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Fuentes: <span className="font-medium text-[#1a1a1a]">CONFECAMARAS</span> e{" "}
            <span className="font-medium text-[#1a1a1a]">Informa Colombia</span>.
          </p>
        </div>
      </div>

      {phase === "loading" && (
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-[#6abf1a] shrink-0" />
            <span>Sincronizando documentos desde integraciones…</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#BBE795] to-[#4a7c59] transition-[width] duration-100 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 tabular-nums text-right">{pct}%</p>
        </div>
      )}

      {phase === "done" && (
        <>
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-[#4a7c59] shrink-0" />
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">Documentación al 100%</p>
            </div>
            <span className="text-xs font-bold tabular-nums text-[#4a7c59] shrink-0">100%</span>
          </div>

          <section className="space-y-3">
            <p className="text-xs font-bold text-[#4a7c59] uppercase tracking-wider">
              Documentos obtenidos / precargados
            </p>
            <div className="grid gap-2">
              {EXTERNAL_DOCS.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.id}
                    className="flex gap-3 items-center p-3 rounded-lg border border-[#BBE795]/40 bg-[#F0FEE6]/25"
                  >
                    <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-md bg-[#BBE795]/30">
                      <Icon className="w-5 h-5 text-[#4a7c59]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1a1a1a] leading-snug">{row.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{row.detail}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#4a7c59] shrink-0" aria-label="Cargado" />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Los datos inferidos alimentan los formularios SARLAFT en pasos posteriores.</span>
          </div>
        </>
      )}
    </div>
  );
}
