"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Trophy, Lock } from "lucide-react";
import { STRESS_EPISODES, STRESS_SUMMARY, formatRetorno, formatMaxDD, type StressEpisode } from "@/lib/asesoria/stressTestData";

/** Desactivar apertura del detalle hasta nueva orden */
const STRESS_MODULE_TEMPORARILY_DISABLED = true;

interface StressHistoryModuleProps {
  fondo?: "FIC Abierto" | "FIC CxC" | "ambos";
}

function EpisodeRow({ episode }: { episode: StressEpisode }) {
  const isPositiveReturn = episode.retornoActual >= 0;
  const isBetter = episode.ganador === "BMK Sugerido";

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {episode.categoria === "crisis" ? (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          ) : episode.categoria === "local" ? (
            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-amber-600 bg-amber-100 rounded flex-shrink-0">CO</span>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-100 rounded flex-shrink-0">GL</span>
          )}
          <span className="text-sm font-medium text-gray-900">{episode.nombre}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 text-center">{episode.periodo}</td>
      <td className="px-4 py-3 text-sm text-gray-600 text-center">{episode.dias}</td>
      <td className={`px-4 py-3 text-sm font-medium text-center ${isPositiveReturn ? "text-green-600" : "text-red-600"}`}>
        {formatRetorno(episode.retornoActual)}
      </td>
      <td className={`px-4 py-3 text-sm font-medium text-center ${episode.retornoSugerido >= 0 ? "text-green-600" : "text-red-600"}`}>
        {formatRetorno(episode.retornoSugerido)}
      </td>
      <td className={`px-4 py-3 text-sm font-medium text-center ${episode.deltaRetorno >= 0 ? "text-green-600" : "text-red-600"}`}>
        {formatRetorno(episode.deltaRetorno)}
      </td>
      <td className="px-4 py-3 text-sm text-red-600 text-center">{formatMaxDD(episode.maxDDActual)}</td>
      <td className="px-4 py-3 text-sm text-red-600 text-center">{formatMaxDD(episode.maxDDSugerido)}</td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isBetter ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        }`}>
          {isBetter ? "Sugerido" : "Actual"}
        </span>
      </td>
    </tr>
  );
}

export function StressHistoryModule({ fondo = "ambos" }: StressHistoryModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "global" | "local" | "crisis">("all");

  const filteredEpisodes = categoryFilter === "all"
    ? STRESS_EPISODES
    : STRESS_EPISODES.filter((e) => e.categoria === categoryFilter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        type="button"
        disabled={STRESS_MODULE_TEMPORARILY_DISABLED}
        onClick={() => setIsExpanded(!isExpanded)}
        title={STRESS_MODULE_TEMPORARILY_DISABLED ? "Próximamente" : undefined}
        className={`w-full px-5 py-4 flex items-center justify-between transition-colors text-left ${
          STRESS_MODULE_TEMPORARILY_DISABLED
            ? "cursor-not-allowed bg-gray-50/80 opacity-80"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">Estrés Histórico</h3>
              {STRESS_MODULE_TEMPORARILY_DISABLED && (
                <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-full bg-gray-200/80">
                  Próximamente
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {STRESS_MODULE_TEMPORARILY_DISABLED
                ? "Sección en preparación"
                : `${STRESS_SUMMARY.totalEpisodios} episodios analizados (2014-2026)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!STRESS_MODULE_TEMPORARILY_DISABLED && (
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
          )}
          {STRESS_MODULE_TEMPORARILY_DISABLED ? (
            <Lock className="w-5 h-5 text-gray-400 shrink-0" aria-hidden />
          ) : isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && !STRESS_MODULE_TEMPORARILY_DISABLED && (
        <div className="border-t border-gray-100">
          {/* Summary Stats */}
          <div className="px-5 py-4 bg-gray-50/50 grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{STRESS_SUMMARY.totalEpisodios}</p>
              <p className="text-xs text-gray-500">Episodios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {STRESS_SUMMARY.promedioRetornoSugerido.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Retorno Prom. Sugerido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {STRESS_SUMMARY.promedioRetornoActual.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Retorno Prom. Actual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {STRESS_SUMMARY.peorMaxDDActual.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Peor Max DD</p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Filtrar:</span>
            {[
              { id: "all", label: "Todos" },
              { id: "global", label: "Global" },
              { id: "local", label: "Colombia" },
              { id: "crisis", label: "Crisis" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id as typeof categoryFilter)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  categoryFilter === filter.id
                    ? "bg-[#4a7c59] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-t border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Episodio</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Período</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Días</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Ret. Actual</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Ret. Sugerido</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Δ Retorno</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">MaxDD Act.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">MaxDD Sug.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Ganador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEpisodes.map((episode) => (
                  <EpisodeRow key={episode.id} episode={episode} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-100 rounded">GL</span>
              <span>Global</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-amber-600 bg-amber-100 rounded">CO</span>
              <span>Colombia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Crisis</span>
            </div>
            <span className="ml-auto">Fuente: Backtesting BMK Genérico vs BMK Sugerido (2014 - Mar 2026)</span>
          </div>
        </div>
      )}
    </div>
  );
}
