"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Trophy,
  Activity,
  TrendingDown,
} from "lucide-react";
import {
  STRESS_EPISODES,
  STRESS_SUMMARY,
  STRESS_REPORT_META,
  TOP_DRAWDOWNS_ABIERTO,
  TOP_DRAWDOWNS_CXC,
  getMacroContext,
  formatRetorno,
  formatMaxDD,
  formatDeltaMacro,
  type StressEpisode,
  type FundDrawdown,
} from "@/lib/asesoria/stressTestData";

interface StressHistoryModuleProps {
  fondo?: "FIC Abierto" | "FIC CxC" | "ambos";
}

// Categorías mostradas en el filtro
const CATEGORY_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "global", label: "Global" },
  { id: "local", label: "Colombia" },
  { id: "crisis", label: "Crisis" },
] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number]["id"];

function EpisodeRow({
  episode,
  isExpanded,
  onToggle,
}: {
  episode: StressEpisode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isPositiveReturn = episode.retornoActual >= 0;
  const isBetter = episode.ganador === "BMK Sugerido";

  return (
    <>
      <tr
        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {episode.categoria === "crisis" ? (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : episode.categoria === "local" ? (
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-amber-600 bg-amber-100 rounded flex-shrink-0">
                CO
              </span>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-100 rounded flex-shrink-0">
                GL
              </span>
            )}
            <span className="text-sm font-medium text-gray-900">{episode.nombre}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 text-center">{episode.periodo}</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-center">{episode.dias}</td>
        <td
          className={`px-4 py-3 text-sm font-medium text-center ${
            isPositiveReturn ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatRetorno(episode.retornoActual)}
        </td>
        <td
          className={`px-4 py-3 text-sm font-medium text-center ${
            episode.retornoSugerido >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatRetorno(episode.retornoSugerido)}
        </td>
        <td
          className={`px-4 py-3 text-sm font-medium text-center ${
            episode.deltaRetorno >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatRetorno(episode.deltaRetorno)}
        </td>
        <td className="px-4 py-3 text-sm text-red-600 text-center">
          {formatMaxDD(episode.maxDDActual)}
        </td>
        <td className="px-4 py-3 text-sm text-red-600 text-center">
          {formatMaxDD(episode.maxDDSugerido)}
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isBetter ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {isBetter ? "Sugerido" : "Actual"}
          </span>
        </td>
        <td className="px-2 py-3 text-center text-gray-400">
          {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {isExpanded && (
        <EpisodeMacroDetailRow episode={episode} />
      )}
    </>
  );
}

function EpisodeMacroDetailRow({ episode }: { episode: StressEpisode }) {
  const macro = getMacroContext(episode.id);

  if (!macro) {
    return (
      <tr>
        <td colSpan={10} className="px-4 py-3 text-xs text-gray-400 italic bg-gray-50/40">
          Sin contexto macro registrado para este episodio.
        </td>
      </tr>
    );
  }

  const metrics: Array<{ label: string; value: string; tone: "neutral" | "delta" }> = [
    { label: "Δ COLCAP", value: formatDeltaMacro(macro.deltaColcap), tone: "delta" },
    { label: "Δ S&P 500", value: formatDeltaMacro(macro.deltaSp500), tone: "delta" },
    { label: "Δ TRM", value: formatDeltaMacro(macro.deltaTrm), tone: "delta" },
    { label: "Δ Brent", value: formatDeltaMacro(macro.deltaBrent), tone: "delta" },
    { label: "Δ CTES", value: formatDeltaMacro(macro.deltaCtes), tone: "delta" },
    { label: "CDS Col. 5Y (prom.)", value: `${macro.cdsColPromedio.toFixed(1)} bps`, tone: "neutral" },
    { label: "IPC a/a (prom.)", value: `${macro.ipcPromedio.toFixed(2)}%`, tone: "neutral" },
  ];

  return (
    <tr className="bg-gray-50/60">
      <td colSpan={10} className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Contexto macro · {episode.fechaInicio} → {episode.fechaFin}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {metrics.map((m) => {
            const numeric = parseFloat(m.value.replace(/[^-\d.]/g, ""));
            const colorClass =
              m.tone === "delta"
                ? numeric >= 0
                  ? "text-green-600"
                  : "text-red-600"
                : "text-gray-900";
            return (
              <div key={m.label} className="bg-white border border-gray-100 rounded-lg px-3 py-2">
                <p className="text-[11px] text-gray-500 leading-tight">{m.label}</p>
                <p className={`text-sm font-semibold ${colorClass}`}>{m.value}</p>
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

function DrawdownTable({
  title,
  drawdowns,
  accent,
}: {
  title: string;
  drawdowns: FundDrawdown[];
  accent: "blue" | "green";
}) {
  const accentBg = accent === "blue" ? "bg-blue-50" : "bg-green-50";
  const accentText = accent === "blue" ? "text-blue-700" : "text-green-700";

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div className={`px-4 py-2 ${accentBg} flex items-center gap-2`}>
        <TrendingDown className={`w-4 h-4 ${accentText}`} />
        <h5 className={`text-sm font-semibold ${accentText}`}>{title}</h5>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/70 border-t border-gray-100">
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Pico
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Trough
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Recuperación
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Profundidad
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Duración
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drawdowns.map((d) => (
              <tr key={`${d.pico}-${d.trough}`} className="hover:bg-gray-50/50">
                <td className="px-3 py-2 text-xs text-gray-700 font-mono">{d.pico}</td>
                <td className="px-3 py-2 text-xs text-gray-700 font-mono">{d.trough}</td>
                <td className="px-3 py-2 text-xs text-gray-700 font-mono">{d.recuperacion}</td>
                <td className="px-3 py-2 text-xs text-red-600 text-center font-medium">
                  {formatMaxDD(d.profundidad)}
                </td>
                <td className="px-3 py-2 text-xs text-gray-700 text-center">{d.duracionDias} d</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                    {d.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StressHistoryModule({ fondo = "ambos" }: StressHistoryModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  const filteredEpisodes =
    categoryFilter === "all"
      ? STRESS_EPISODES
      : STRESS_EPISODES.filter((e) => e.categoria === categoryFilter);

  const ventanaLabel = `Ene 2017 - Mar 2026`;
  const subtitle = `${STRESS_SUMMARY.totalEpisodios} episodios de estrés analizados (${ventanaLabel})`;

  const showAbiertoDD = fondo === "FIC Abierto" || fondo === "ambos";
  const showCxcDD = fondo === "FIC CxC" || fondo === "ambos";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900">Estrés Histórico</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">{STRESS_SUMMARY.victoriasBMKSugerido}</span>
              <span className="text-gray-400">Sugerido</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="font-medium">{STRESS_SUMMARY.victoriasBMKActual}</span>
              <span className="text-gray-400">Actual</span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Summary Stats */}
          <div className="px-5 py-4 bg-gray-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{STRESS_SUMMARY.totalEpisodios}</p>
              <p className="text-xs text-gray-500">Episodios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatRetorno(STRESS_SUMMARY.promedioRetornoSugerido)}
              </p>
              <p className="text-xs text-gray-500">Retorno Prom. Sugerido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatRetorno(STRESS_SUMMARY.promedioRetornoActual)}
              </p>
              <p className="text-xs text-gray-500">Retorno Prom. Actual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatMaxDD(STRESS_SUMMARY.peorMaxDDActual)}
              </p>
              <p className="text-xs text-gray-500">Peor MaxDD Actual</p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Filtrar:</span>
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  categoryFilter === filter.id
                    ? "bg-[#4a7c59] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-gray-400">
              Clic en una fila para ver el contexto macro
            </span>
          </div>

          {/* Episodes Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-t border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Episodio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Período
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Días
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ret. Actual
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ret. Sugerido
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Δ Retorno
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    MaxDD Act.
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    MaxDD Sug.
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ganador
                  </th>
                  <th className="px-2 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEpisodes.map((episode) => (
                  <EpisodeRow
                    key={episode.id}
                    episode={episode}
                    isExpanded={expandedEpisode === episode.id}
                    onToggle={() =>
                      setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Top-5 Drawdowns por fondo */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Top-5 drawdowns históricos
              </h4>
              <p className="text-xs text-gray-500">
                Peores episodios desde el máximo previo en la ventana {STRESS_REPORT_META.ventanaInicio} → {STRESS_REPORT_META.ventanaFin}.
              </p>
            </div>
            <div
              className={`grid gap-4 ${
                showAbiertoDD && showCxcDD ? "lg:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {showAbiertoDD && (
                <DrawdownTable
                  title="Alianza Fondo Abierto"
                  drawdowns={TOP_DRAWDOWNS_ABIERTO}
                  accent="blue"
                />
              )}
              {showCxcDD && (
                <DrawdownTable title="Alianza CxC" drawdowns={TOP_DRAWDOWNS_CXC} accent="green" />
              )}
            </div>
          </div>

          {/* Legend & Source */}
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-100 rounded">
                GL
              </span>
              <span>Global</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-amber-600 bg-amber-100 rounded">
                CO
              </span>
              <span>Colombia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Crisis</span>
            </div>
            <span className="ml-auto text-right">
              Fuente: {STRESS_REPORT_META.fuentePrimaria} · {STRESS_REPORT_META.fuenteSecundaria}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
