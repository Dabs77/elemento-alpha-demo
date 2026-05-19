"use client";

import { useState, useCallback } from "react";
import { Search, User, Wallet, Calendar, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import {
  generateSimulatedClient,
  normalizeSimulatedClient,
  formatCOP,
  formatNumber,
  type SimulatedClientPosition,
} from "@/lib/asesoria/simulatedClientData";
import { FIC_ABIERTO_DATA, FIC_CXC_DATA } from "@/lib/asesoria/fundDataService";
import { StressHistoryModule } from "./StressHistoryModule";
import { RecommendationsModule } from "./RecommendationsModule";

export function ClienteExistenteView() {
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState<SimulatedClientPosition | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(() => {
    if (!cedula.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setCliente(normalizeSimulatedClient(generateSimulatedClient(cedula)));
      setIsSearching(false);
    }, 500);
  }, [cedula]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Buscar Cliente</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese número de cédula o NIT"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a7c59]/20 focus:border-[#4a7c59] outline-none transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!cedula.trim() || isSearching}
            className="px-5 py-2.5 bg-[#4a7c59] text-white text-sm font-medium rounded-lg hover:bg-[#3d6549] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Demo: Ingrese cualquier número para generar datos simulados de un cliente.
        </p>
      </div>

      {/* Client Info */}
      {cliente && (
        <>
          {/* Client Header */}
          <div className="bg-gradient-to-r from-[#4a7c59]/10 to-[#BBE795]/20 rounded-xl border border-[#4a7c59]/20 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#4a7c59] rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cliente.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    {cliente.tipoCliente === "persona_juridica" ? "NIT" : "C.C."} {cliente.cedula}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#4a7c59]">{formatCOP(cliente.posicionActual)}</p>
                <p className="text-sm text-gray-600">Posición actual</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-5">
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Unidades</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatNumber(cliente.unidadesFondo)}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Valor Unidad</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">${formatNumber(cliente.valorUnidad)}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Permanencia</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{cliente.tiempoPermanenciaMeses} meses</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-medium">Rentabilidad fondo</span>
                </div>
                <p className="text-sm font-semibold text-green-600">
                  {(cliente.fondo === "FIC CxC" ? FIC_CXC_DATA : FIC_ABIERTO_DATA).performance
                    .rentabilidadAnoCorrido}
                </p>
              </div>
            </div>
          </div>

          {/* Fund Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fund Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">FIC Abierto Alianza</h3>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Conservador
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AUMs</span>
                  <span className="font-medium text-gray-900">{FIC_ABIERTO_DATA.basicInfo.aums}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Calificación Crédito</span>
                  <span className="font-medium text-gray-900">AAA (BRC)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Calificación Mercado</span>
                  <span className="font-medium text-gray-900">2+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Liquidez</span>
                  <span className="font-medium text-gray-900">Vista</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duración</span>
                  <span className="font-medium text-gray-900">{FIC_ABIERTO_DATA.basicInfo.duracionActivo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Inversionistas</span>
                  <span className="font-medium text-gray-900">{FIC_ABIERTO_DATA.basicInfo.inversionistas}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Rentabilidad</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Último Mes</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadUltimoMes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trimestre</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadTrimestre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Año Corrido</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadAnoCorrido}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Últimos 3 Años</span>
                  <span className="font-semibold text-green-600">{FIC_ABIERTO_DATA.performance.rentabilidadUltimos3Anos}</span>
                </div>
                <div className="border-t border-gray-100 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Volatilidad YTD</span>
                  <span className="font-medium text-gray-900">{FIC_ABIERTO_DATA.performance.volatilidad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días Negativos YTD</span>
                  <span className="font-medium text-amber-600">{FIC_ABIERTO_DATA.performance.diasNegativosYTD}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Composition */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Composición del Portafolio</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Por Calificación */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Por Calificación</h4>
                <div className="space-y-2">
                  {FIC_ABIERTO_DATA.composition.porCalificacion.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4a7c59] rounded-full"
                            style={{ width: item.porcentaje }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-12 text-right">{item.porcentaje}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Tipo de Renta */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Por Tipo de Renta</h4>
                <div className="space-y-2">
                  {FIC_ABIERTO_DATA.composition.porTipoRenta.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: item.porcentaje }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-12 text-right">{item.porcentaje}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Por Sector */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Por Sector</h4>
                <div className="space-y-2">
                  {FIC_ABIERTO_DATA.composition.porSector.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: item.porcentaje }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-12 text-right">{item.porcentaje}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stress History Module */}
          <StressHistoryModule fondo="FIC Abierto" />

          {/* Recommendations */}
          <RecommendationsModule cliente={cliente} />
        </>
      )}

      {/* Empty State */}
      {!cliente && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar un cliente existente</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Ingrese el número de cédula o NIT del cliente para ver su información, posición actual en el fondo y métricas de desempeño.
          </p>
        </div>
      )}
    </div>
  );
}
