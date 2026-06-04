import Link from "next/link";
import { ChevronLeft, Calculator } from "lucide-react";
import { AsistenteCalculoVoice } from "@/components/asistente-calculo/AsistenteCalculoVoice";

export default function AsistenteCalculoPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Inicio
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#4a7c59]" />
              <h1 className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
                Asistente de Cálculo
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-6">
              Fase 5 · ElevenLabs Conversational AI
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#4a7c59] bg-[#F0FEE6] px-3 py-1.5 rounded-full ring-1 ring-[#BBE795]/40">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3h3v18H6V3zm9 0h3v18h-3V3z" />
            </svg>
            ElevenLabs
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1a1a1a]">
              Asistente de Cálculo
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Presiona <strong>Hablar</strong> para iniciar la conversación con el asistente.
            </p>
          </div>

          <AsistenteCalculoVoice />
        </div>
      </main>
    </div>
  );
}
