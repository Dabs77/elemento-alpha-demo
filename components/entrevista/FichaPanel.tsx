"use client";

import { Check, Circle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EntrevistaFicha, MissingField } from "@/lib/entrevista/harness";

function SectionShell({
  title,
  filled,
  children,
}: {
  title: string;
  filled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-1.5">
        {filled ? (
          <Check className="w-3.5 h-3.5 text-[#4a7c59] shrink-0" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        )}
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            filled ? "text-[#1a1a1a]" : "text-gray-400"
          }`}
        >
          {title}
        </span>
      </div>
      {filled ? (
        <div className="pl-5.5 text-sm text-gray-700 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      ) : (
        <p className="pl-5.5 text-sm text-gray-400 italic">Pendiente</p>
      )}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside ml-4 space-y-0.5">
      {items.map((item, i) => (
        <li key={`${item}-${i}`}>{item}</li>
      ))}
    </ul>
  );
}

export function FichaPanel({
  ficha,
  missing,
  completeness,
  isExtracting,
}: {
  ficha: EntrevistaFicha;
  missing: MissingField[];
  completeness: number;
  isExtracting: boolean;
}) {
  const has = (v: unknown[] | undefined) => Array.isArray(v) && v.length > 0;

  const download = () => {
    const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (ficha.empresa ?? "entrevista").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `ficha-necesidades-${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Ficha de necesidades</h2>
          {isExtracting ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analizando
            </span>
          ) : (
            <span className="text-xs font-medium text-[#4a7c59]">{completeness}%</span>
          )}
        </div>

        <div className="mt-2.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#BBE795] transition-all duration-700"
            style={{ width: `${completeness}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {missing.length === 0
            ? "Todo lo esencial quedó cubierto."
            : `Faltan por cubrir: ${missing.map((m) => m.label).join(", ")}.`}
        </p>
      </div>

      <div className="px-5 py-2 max-h-[28rem] overflow-y-auto">
        <SectionShell title="Identidad" filled={Boolean(ficha.empresa)}>
          <p>
            {ficha.empresa} · {ficha.area}
          </p>
          <p className="text-gray-500">{ficha.rol}</p>
        </SectionShell>

        <SectionShell title="Responsabilidades" filled={has(ficha.responsabilidades)}>
          <BulletList items={ficha.responsabilidades ?? []} />
        </SectionShell>

        <SectionShell title="Procesos" filled={has(ficha.procesos)}>
          <ul className="list-disc list-outside ml-4 space-y-0.5">
            {(ficha.procesos ?? []).map((p, i) => (
              <li key={`${p.nombre}-${i}`}>
                {p.nombre}
                {(p.frecuencia || p.duracionAprox) && (
                  <span className="text-gray-500">
                    {" — "}
                    {[p.frecuencia, p.duracionAprox].filter(Boolean).join(", ")}
                  </span>
                )}
                {p.manual && <span className="text-gray-500"> · manual</span>}
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell title="Dolores" filled={has(ficha.dolores)}>
          <ul className="space-y-1.5">
            {(ficha.dolores ?? []).map((d, i) => (
              <li key={`${d.descripcion}-${i}`} className="flex items-start gap-2">
                {d.impacto && (
                  <span
                    className={`mt-0.5 shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ring-1 ${
                      d.impacto === "alto"
                        ? "text-red-700 bg-red-50 ring-red-200"
                        : d.impacto === "medio"
                          ? "text-amber-700 bg-amber-50 ring-amber-200"
                          : "text-gray-600 bg-gray-50 ring-gray-200"
                    }`}
                  >
                    {d.impacto}
                  </span>
                )}
                <span>
                  {d.descripcion}
                  {d.frecuencia && <span className="text-gray-500"> — {d.frecuencia}</span>}
                </span>
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell title="Herramientas" filled={has(ficha.herramientas)}>
          <ul className="list-disc list-outside ml-4 space-y-0.5">
            {(ficha.herramientas ?? []).map((h, i) => (
              <li key={`${h.nombre}-${i}`}>
                {h.nombre}
                {h.usoPrincipal && <span className="text-gray-500"> — {h.usoPrincipal}</span>}
                {h.satisfaccion && <span className="text-gray-500"> · {h.satisfaccion}</span>}
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell title="Volumen" filled={has(ficha.volumen)}>
          <ul className="list-disc list-outside ml-4 space-y-0.5">
            {(ficha.volumen ?? []).map((v, i) => (
              <li key={`${v.metrica}-${i}`}>
                {v.metrica}: <strong className="font-medium">{v.valor}</strong>
                {v.periodo && <span className="text-gray-500"> / {v.periodo}</span>}
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell
          title="Personas involucradas"
          filled={typeof ficha.personasInvolucradas === "number"}
        >
          <p>{ficha.personasInvolucradas}</p>
        </SectionShell>

        <SectionShell title="Indicadores" filled={has(ficha.kpis)}>
          <BulletList items={ficha.kpis ?? []} />
        </SectionShell>

        <SectionShell title="Intentos previos" filled={has(ficha.intentosPrevios)}>
          <BulletList items={ficha.intentosPrevios ?? []} />
        </SectionShell>

        <SectionShell title="Urgencia" filled={Boolean(ficha.urgencia)}>
          <p className="capitalize">{ficha.urgencia}</p>
        </SectionShell>

        <SectionShell title="Citas textuales" filled={has(ficha.citasTextuales)}>
          <div className="space-y-1.5">
            {(ficha.citasTextuales ?? []).map((c, i) => (
              <blockquote
                key={`${c}-${i}`}
                className="border-l-2 border-[#BBE795] pl-2.5 text-gray-600 italic"
              >
                {c}
              </blockquote>
            ))}
          </div>
        </SectionShell>
      </div>

      <div className="px-5 py-4 border-t border-gray-100">
        <Button variant="outline" className="w-full" onClick={download}>
          <Download className="w-4 h-4" />
          Descargar JSON
        </Button>
      </div>
    </div>
  );
}
