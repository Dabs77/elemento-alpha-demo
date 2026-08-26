import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { JourneyShell } from "@/components/journey/JourneyShell";
import { ALPHA_BRAND, JourneyBrandProvider } from "@/components/journey/brand";
import "../v2/journey.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "Journey del Asesor · Fiduciaria Alpha",
  description:
    "Plataforma agéntica para asesoría y ejecución de venta de fondos de Fiduciaria Alpha.",
};

export default function AsesoriaEspecializadaAlphaPage() {
  return (
    <div className={`journey-root ${inter.variable} ${jakarta.variable}`}>
      <JourneyBrandProvider brand={ALPHA_BRAND}>
        <JourneyShell />
      </JourneyBrandProvider>
    </div>
  );
}
