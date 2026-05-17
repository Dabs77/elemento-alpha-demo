"use client";

import { CheckCircle2, XCircle, Minus, TrendingUp, Shield, Clock, BarChart3 } from "lucide-react";
import { FIC_ABIERTO_DATA, FIC_CXC_DATA, FUND_COMPARISON_TABLE } from "@/lib/asesoria/fundDataService";
import { StressHistoryModule } from "./StressHistoryModule";

function ComparisonIndicator({ winner }: { winner?: "abierto" | "cxc" | "empate" }) {
  if (winner === "abierto") {
    return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
  }
  if (winner === "cxc") {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  return <Minus className="w-4 h-4 text-gray-400" />;
}

export function ClienteNuevoView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Comparativa de Fondos</h2>
        <p className="text-sm text-gray-600">
          Compare las características, rentabilidades y riesgos de FIC Abierto vs FIC CxC para determinar la mejor opción según el perfil del cliente.
        </p>
      </div>

      {/* Fund Cards Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* FIC Abierto */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">FIC Abierto Alianza</h3>
              <p className="text-xs text-gray-500 mt-0.5">Fondo de Inversión Colectiva Abierto</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Conservador
            </span>
          </div>

          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">AUMs</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{FIC_ABIERTO_DATA.basicInfo.aums}</p>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Calificación</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">AAA / 2+</p>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Liquidez</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">Vista</p>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Duración</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{FIC_ABIERTO_DATA.basicInfo.duracionActivo}</p>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rentabilidad</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Último Mes</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadUltimoMes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Año Corrido</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadAnoCorrido}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Últimos 3 Años</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadUltimos3Anos}</span>
                </div>
              </div>
            </div>

            {/* Risk */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Riesgo</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Volatilidad YTD</span>
                  <span className="font-medium text-gray-900">{FIC_ABIERTO_DATA.performance.volatilidad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días Negativos YTD</span>
                  <span className="font-medium text-amber-600">{FIC_ABIERTO_DATA.performance.diasNegativosYTD}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meses Neg. (8 años)</span>
                  <span className="font-medium text-amber-600">{FIC_ABIERTO_DATA.performance.diasNegativosUltimos8Anos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FIC CxC */}
        <div className="bg-white rounded-xl border-2 border-green-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">FIC CxC Alianza</h3>
              <p className="text-xs text-gray-500 mt-0.5">Fondo con pacto de permanencia 30 días</p>
            </div>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Moderado
            </span>
          </div>

          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-green-600 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">AUMs</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{FIC_CXC_DATA.basicInfo.aums}</p>
              </div>
              <div className="bg-green-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-green-600 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Calificación</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">AAA / VrM 1</p>
              </div>
              <div className="bg-green-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-green-600 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Liquidez</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">30 días</p>
              </div>
              <div className="bg-green-50/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-green-600 mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Duración</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{FIC_CXC_DATA.basicInfo.duracionActivo}</p>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rentabilidad</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Último Mes</span>
                  <span className="font-semibold text-green-600">{FIC_CXC_DATA.performance.rentabilidadUltimoMes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Año Corrido</span>
                  <span className="font-semibold text-green-600">{FIC_CXC_DATA.performance.rentabilidadAnoCorrido}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Últimos 3 Años</span>
                  <span className="font-semibold text-green-600">{FIC_CXC_DATA.performance.rentabilidadUltimos3Anos}</span>
                </div>
              </div>
            </div>

            {/* Risk */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Riesgo</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Volatilidad YTD</span>
                  <span className="font-medium text-gray-900">{FIC_CXC_DATA.performance.volatilidad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días Negativos YTD</span>
                  <span className="font-medium text-green-600">{FIC_CXC_DATA.performance.diasNegativosYTD}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meses Neg. (8 años)</span>
                  <span className="font-medium text-green-600">{FIC_CXC_DATA.performance.diasNegativosUltimos8Anos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Tabla Comparativa Detallada</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Métrica</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wide">FIC Abierto</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wide">FIC CxC</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide w-16">Mejor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FUND_COMPARISON_TABLE.map((row) => (
                <tr key={row.metrica} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-gray-700">{row.metrica}</td>
                  <td className={`px-5 py-3 text-sm text-center ${row.destacado === "abierto" ? "font-semibold text-blue-600" : "text-gray-900"}`}>
                    {row.ficAbierto}
                  </td>
                  <td className={`px-5 py-3 text-sm text-center ${row.destacado === "cxc" ? "font-semibold text-green-600" : "text-gray-900"}`}>
                    {row.ficCxC}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center">
                      <ComparisonIndicator winner={row.destacado} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CxC Composition Highlight */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Composición FIC CxC - Activos Alternativos</h3>
        <p className="text-sm text-gray-600 mb-4">
          El FIC CxC se diferencia por su exposición a Derechos de Crédito (DCE), incluyendo libranzas y sentencias con cargo al Presupuesto General de la Nación (riesgo cuasi-soberano).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Por Tipo de Activo</h4>
            <div className="space-y-2">
              {FIC_CXC_DATA.composition.porCalificacion.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: item.porcentaje }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-14 text-right">{item.porcentaje}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Por Sector</h4>
            <div className="space-y-2">
              {FIC_CXC_DATA.composition.porSector.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: item.porcentaje }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-14 text-right">{item.porcentaje}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stress History for Both Funds */}
      <StressHistoryModule fondo="ambos" />

      {/* Recommendation Box */}
      <div className="bg-gradient-to-r from-[#4a7c59]/10 to-[#BBE795]/20 rounded-xl border border-[#4a7c59]/20 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Recomendación</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 mb-2">FIC Abierto es ideal para:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clientes que requieren liquidez inmediata</li>
              <li>• Perfil conservador que prioriza disponibilidad</li>
              <li>• Tesorería corporativa con necesidades de caja</li>
              <li>• Inversionistas que no pueden comprometer plazos</li>
            </ul>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-medium text-green-700 mb-2">FIC CxC es ideal para:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clientes que buscan mayor rentabilidad</li>
              <li>• Perfil moderado con horizonte mínimo 30 días</li>
              <li>• Exposición a activos alternativos (DCE)</li>
              <li>• Menor volatilidad y días negativos históricos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
