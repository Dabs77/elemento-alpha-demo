import Link from "next/link";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { EntrevistaClient } from "@/components/entrevista/EntrevistaClient";

export default function EntrevistaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Inicio
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#4a7c59]" />
              <h1 className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
                Entrevista de necesidades
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-6">
              Descubrimiento por voz · Gemini Live
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#4a7c59] bg-[#F0FEE6] px-3 py-1.5 rounded-full ring-1 ring-[#BBE795]/40">
            Gemini Live
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <EntrevistaClient />
      </main>
    </div>
  );
}
