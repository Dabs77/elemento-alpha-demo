import type { Metadata } from "next";
import { PdfVlmExtractor } from "@/components/extras/PdfVlmExtractor";

export const metadata: Metadata = {
  title: "Extra · PDF + modelo de visión | Elemento",
  description:
    "Herramienta aparte del flujo por fases: extracción página por página de PDF con modelo de visión (Gemini).",
};

export default function PdfVlmExtrasPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PdfVlmExtractor />
    </div>
  );
}
