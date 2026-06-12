"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Bell, Mic, Lock } from "lucide-react";
import { ClienteExistenteView } from "@/components/asesoria/ClienteExistenteView";
import { ClienteNuevoView } from "@/components/asesoria/ClienteNuevoView";
import { AlertsModule } from "@/components/asesoria/AlertsModule";
import { AdvisoryVoicePanel } from "@/components/asesoria/AdvisoryVoicePanel";
import { AdvisoryVoicePanelCxC } from "@/components/asesoria/AdvisoryVoicePanelCxC";
import { AdvisoryVoicePanelBothFunds } from "@/components/asesoria/AdvisoryVoicePanelBothFunds";
import { AdvisoryVoicePanelFullCorpus } from "@/components/asesoria/AdvisoryVoicePanelFullCorpus";
import { AdvisoryVoicePanelElevenLabs } from "@/components/asesoria/AdvisoryVoicePanelElevenLabs";

type TabId = "existente" | "nuevo";

export default function AsesoriaEspecializadaPage() {
  const [activeTab, setActiveTab] = useState<TabId>("existente");
  /** Panel de alertas deshabilitado temporalmente */
  const showAlerts = false;
  const [showVoice, setShowVoice] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-lg font-semibold text-gray-900">
                Asesoría Especializada de Fondos
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                title="Próximamente"
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-70"
              >
                <Lock className="w-4 h-4 shrink-0" aria-hidden />
                <Bell className="w-4 h-4 shrink-0" aria-hidden />
                Alertas
                <span className="text-xs font-normal text-gray-400">(pronto)</span>
              </button>
              <button
                onClick={() => setShowVoice(!showVoice)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showVoice
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Mic className="w-4 h-4" />
                Voz
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("existente")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "existente"
                  ? "border-[#4a7c59] text-[#4a7c59]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="w-4 h-4" />
              Cliente Existente
            </button>
            <button
              onClick={() => setActiveTab("nuevo")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "nuevo"
                  ? "border-[#4a7c59] text-[#4a7c59]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Cliente Nuevo
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`flex-1 ${showAlerts || showVoice ? "max-w-[calc(100%-360px)]" : ""}`}>
            {activeTab === "existente" ? <ClienteExistenteView /> : <ClienteNuevoView />}
          </div>

          {/* Side Panel */}
          {(showAlerts || showVoice) && (
            <div className="w-[340px] flex-shrink-0 space-y-4">
              {showAlerts && <AlertsModule />}
              {showVoice && (
                <>
                  <AdvisoryVoicePanelElevenLabs />
                  <AdvisoryVoicePanel />
                  <AdvisoryVoicePanelCxC />
                  <AdvisoryVoicePanelBothFunds />
                  <AdvisoryVoicePanelFullCorpus />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
