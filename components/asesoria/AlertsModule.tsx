"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, Filter } from "lucide-react";
import { generateAllAlerts, countAlertsBySeverity, type Alert, type AlertSeverity } from "@/lib/asesoria/alertsEngine";

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: typeof AlertTriangle; bgColor: string; textColor: string; borderColor: string; label: string }> = {
  danger: {
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    label: "Crítica",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    label: "Precaución",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    label: "Positiva",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    label: "Informativa",
  },
};

function AlertCard({ alert }: { alert: Alert }) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-medium ${config.textColor}`}>{alert.titulo}</h4>
            {alert.fondo && alert.fondo !== "ambos" && (
              <span className="text-xs px-1.5 py-0.5 bg-white/60 rounded text-gray-600 flex-shrink-0">
                {alert.fondo}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{alert.descripcion}</p>
          {alert.valor && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold ${config.textColor}`}>{alert.valor}</span>
              {alert.umbral && (
                <span className="text-xs text-gray-500">Umbral: {alert.umbral}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertsModule() {
  const alerts = useMemo(() => generateAllAlerts(), []);
  const counts = useMemo(() => countAlertsBySeverity(alerts), [alerts]);
  const [filter, setFilter] = useState<AlertSeverity | "all">("all");

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Señales y Alertas</h3>
          <div className="flex items-center gap-1">
            {counts.danger > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                {counts.danger}
              </span>
            )}
            {counts.warning > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                {counts.warning}
              </span>
            )}
            {counts.success > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                {counts.success}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center gap-1 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <button
          onClick={() => setFilter("all")}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            filter === "all"
              ? "bg-gray-200 text-gray-800"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Todas ({alerts.length})
        </button>
        {(["danger", "warning", "success", "info"] as AlertSeverity[]).map((severity) => {
          const config = SEVERITY_CONFIG[severity];
          const count = counts[severity];
          if (count === 0) return null;
          return (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                filter === severity
                  ? `${config.bgColor} ${config.textColor}`
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="max-h-[400px] overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              No hay alertas con este filtro
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">
          Actualizado: {new Date().toLocaleTimeString("es-CO")} · Demo con datos simulados
        </p>
      </div>
    </div>
  );
}
